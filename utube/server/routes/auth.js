import { Router } from "express";
import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env.js";
import {
  COOKIE,
  clearCookieOptions,
  oauthCookieOptions,
  sessionCookieOptions,
} from "../lib/cookies.js";
import { encrypt } from "../lib/crypto.js";
import {
  GOOGLE_SCOPES,
  PROFILE_SCOPES,
  createOAuthClient,
  createPkce,
  getGoogleProfile,
  randomState,
  youtubeClientFromEncryptedToken,
} from "../lib/google.js";
import { listWorkspacesForUser } from "../lib/workspaces.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSameOrigin } from "../middleware/csrfOrigin.js";
import { User } from "../models/User.js";

export const authRouter = Router();

function signSession(userId) {
  const { jwtSecret } = loadEnv();
  return jwt.sign({ sub: String(userId) }, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

function safeAuthError(raw) {
  if (raw === "access_denied") return "denied";
  return "failed";
}

authRouter.get("/google", async (req, res, next) => {
  try {
    const forceConsent = req.query.force === "1";
    const intent = req.query.intent === "member" ? "member" : "youtube";
    const state = randomState();
    const { verifier, challenge } = createPkce();
    const client = createOAuthClient();

    res.cookie(COOKIE.oauthState, state, oauthCookieOptions());
    res.cookie(COOKIE.pkce, verifier, oauthCookieOptions());
    res.cookie(COOKIE.oauthIntent, intent, oauthCookieOptions());

    const scopes = intent === "member" ? PROFILE_SCOPES : GOOGLE_SCOPES;

    const url = client.generateAuthUrl({
      access_type: intent === "member" ? "online" : "offline",
      include_granted_scopes: true,
      scope: scopes,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      ...(forceConsent && intent !== "member"
        ? { prompt: "consent" }
        : { prompt: "select_account" }),
    });

    if (req.headers.accept?.includes("application/json")) {
      return res.json({ url });
    }
    return res.redirect(url);
  } catch (err) {
    next(err);
  }
});

authRouter.get("/google/callback", async (req, res) => {
  const { clientOrigin } = loadEnv();
  const fail = (code) => res.redirect(`${clientOrigin}/?authError=${code}`);

  try {
    if (req.query.error) {
      return fail(safeAuthError(String(req.query.error)));
    }

    const { code, state } = req.query;
    const cookieState = req.cookies?.[COOKIE.oauthState];
    const verifier = req.cookies?.[COOKIE.pkce];
    const intent = req.cookies?.[COOKIE.oauthIntent] === "member" ? "member" : "youtube";

    if (!code || !state || !cookieState || state !== cookieState || !verifier) {
      return fail("failed");
    }

    const client = createOAuthClient();
    const { tokens } = await client.getToken({
      code: String(code),
      codeVerifier: verifier,
    });
    client.setCredentials(tokens);

    const profile = await getGoogleProfile(client);
    if (!profile?.id || !profile.email) {
      return fail("failed");
    }

    let user = await User.findOne({ googleId: profile.id });

    if (intent === "member") {
      // Profile-only: upsert identity, keep any existing YouTube token fields
      user = await User.findOneAndUpdate(
        { googleId: profile.id },
        {
          googleId: profile.id,
          email: profile.email,
          name: profile.name || "",
          picture: profile.picture || "",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      res.clearCookie(COOKIE.oauthState, clearCookieOptions());
      res.clearCookie(COOKIE.pkce, clearCookieOptions());
      res.clearCookie(COOKIE.oauthIntent, clearCookieOptions());
      res.cookie(COOKIE.session, signSession(user._id), sessionCookieOptions());

      const invitePending = Boolean(req.cookies?.[COOKIE.inviteToken]);
      return res.redirect(
        invitePending ? `${clientOrigin}/invite/complete` : `${clientOrigin}/`,
      );
    }

    // YouTube owner path (existing behavior)
    if (!tokens.refresh_token && !user?.refreshTokenEnc) {
      res.clearCookie(COOKIE.oauthState, clearCookieOptions());
      res.clearCookie(COOKIE.pkce, clearCookieOptions());
      res.clearCookie(COOKIE.oauthIntent, clearCookieOptions());
      return res.redirect("/auth/google?force=1");
    }

    const refreshTokenEnc = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : user.refreshTokenEnc;

    let youtubeChannelId = user?.youtubeChannelId || "";
    let youtubeChannelTitle = user?.youtubeChannelTitle || "";
    let uploadsPlaylistId = user?.uploadsPlaylistId || "";
    try {
      const { youtube } = youtubeClientFromEncryptedToken(refreshTokenEnc);
      const channelRes = await youtube.channels.list({
        part: ["snippet", "contentDetails"],
        mine: true,
      });
      const channel = channelRes.data.items?.[0];
      if (channel) {
        youtubeChannelId = channel.id || "";
        youtubeChannelTitle = channel.snippet?.title || "";
        uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads || "";
      }
    } catch {
      // User can still sign in without a YouTube channel.
    }

    user = await User.findOneAndUpdate(
      { googleId: profile.id },
      {
        googleId: profile.id,
        email: profile.email,
        name: profile.name || "",
        picture: profile.picture || "",
        youtubeChannelId,
        youtubeChannelTitle,
        uploadsPlaylistId,
        refreshTokenEnc,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.clearCookie(COOKIE.oauthState, clearCookieOptions());
    res.clearCookie(COOKIE.pkce, clearCookieOptions());
    res.clearCookie(COOKIE.oauthIntent, clearCookieOptions());
    res.cookie(COOKIE.session, signSession(user._id), sessionCookieOptions());
    return res.redirect(`${clientOrigin}/`);
  } catch {
    return fail("failed");
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const workspaces = await listWorkspacesForUser(req.user);
    res.json({ user: req.user.toPublicJSON(), workspaces });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", requireSameOrigin, async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE.session];
    if (token) {
      const { jwtSecret } = loadEnv();
      try {
        const payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
        const user = await User.findById(payload.sub);
        if (user?.refreshTokenEnc) {
          const { decrypt } = await import("../lib/crypto.js");
          const client = createOAuthClient();
          await client.revokeToken(decrypt(user.refreshTokenEnc));
        }
      } catch {
        // Best-effort revoke.
      }
    }
  } finally {
    res.clearCookie(COOKIE.session, clearCookieOptions());
    res.clearCookie(COOKIE.inviteToken, clearCookieOptions());
    res.json({ ok: true });
  }
});
