import crypto from "node:crypto";
import { Router } from "express";
import { loadEnv } from "../config/env.js";
import {
  COOKIE,
  clearCookieOptions,
  oauthCookieOptions,
} from "../lib/cookies.js";
import { sendInviteEmail } from "../lib/mail.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSameOrigin } from "../middleware/csrfOrigin.js";
import { requireOwnerRole, requireWorkspace } from "../middleware/workspace.js";
import { MEMBERSHIP_ROLES, Membership } from "../models/Membership.js";

export const teamRouter = Router();

const TOKEN_RE = /^[A-Za-z0-9_-]{20,128}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashToken(raw) {
  return crypto.createHash("sha256").update(String(raw)).digest("hex");
}

function createInviteToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function roleLabel(role) {
  return role === "video_editor" ? "video editor" : "content writer";
}

teamRouter.get(
  "/invites/prepare/:token",
  async (req, res) => {
    const raw = String(req.params.token || "");
    if (!TOKEN_RE.test(raw)) {
      return res.status(400).json({ error: "Invalid invite link.", code: "INVALID_INVITE" });
    }

    const membership = await Membership.findOne({
      inviteTokenHash: hashToken(raw),
      status: "pending",
    });

    if (!membership || !membership.expiresAt || membership.expiresAt < new Date()) {
      return res.status(410).json({ error: "Invite expired or invalid.", code: "INVITE_EXPIRED" });
    }

    res.cookie(COOKIE.inviteToken, raw, {
      ...oauthCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      ok: true,
      email: membership.email,
      role: membership.role,
    });
  },
);

teamRouter.use(requireAuth);

teamRouter.get("/", requireWorkspace, requireOwnerRole, async (req, res, next) => {
  try {
    const members = await Membership.find({ ownerUserId: req.workspace.owner._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      members: members.map((m) => ({
        id: String(m._id),
        email: m.email,
        role: m.role,
        status: m.status,
        memberUserId: m.memberUserId ? String(m.memberUserId) : null,
        expiresAt: m.expiresAt,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

teamRouter.post(
  "/invites",
  requireSameOrigin,
  requireWorkspace,
  requireOwnerRole,
  async (req, res, next) => {
    try {
      const email = String(req.body?.email || "")
        .trim()
        .toLowerCase();
      const role = String(req.body?.role || "");

      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: "Enter a valid email.", code: "INVALID_EMAIL" });
      }
      if (!MEMBERSHIP_ROLES.includes(role)) {
        return res.status(400).json({ error: "Invalid role.", code: "INVALID_ROLE" });
      }
      if (email === String(req.user.email || "").toLowerCase()) {
        return res.status(400).json({
          error: "You cannot invite yourself.",
          code: "INVALID_EMAIL",
        });
      }

      const owner = req.workspace.owner;
      const existing = await Membership.findOne({ ownerUserId: owner._id, email });

      if (existing?.status === "active") {
        return res.status(409).json({
          error: "That person is already on this channel.",
          code: "ALREADY_MEMBER",
        });
      }

      const rawToken = createInviteToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const membership = await Membership.findOneAndUpdate(
        { ownerUserId: owner._id, email },
        {
          ownerUserId: owner._id,
          email,
          role,
          status: "pending",
          memberUserId: null,
          inviteTokenHash: hashToken(rawToken),
          expiresAt,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      const { clientOrigin } = loadEnv();
      const inviteUrl = `${clientOrigin}/invite/${rawToken}`;
      const channelTitle = owner.youtubeChannelTitle || owner.email || "your channel";

      let emailed = false;
      try {
        emailed = await sendInviteEmail({
          to: email,
          inviteUrl,
          channelTitle,
          role: roleLabel(role),
        });
      } catch {
        emailed = false;
      }

      return res.status(201).json({
        member: {
          id: String(membership._id),
          email: membership.email,
          role: membership.role,
          status: membership.status,
          expiresAt: membership.expiresAt,
        },
        inviteUrl: emailed ? undefined : inviteUrl,
        emailed,
      });
    } catch (err) {
      next(err);
    }
  },
);

teamRouter.delete(
  "/members/:id",
  requireSameOrigin,
  requireWorkspace,
  requireOwnerRole,
  async (req, res, next) => {
    try {
      const membership = await Membership.findOne({
        _id: req.params.id,
        ownerUserId: req.workspace.owner._id,
      });
      if (!membership) {
        return res.status(404).json({ error: "Member not found.", code: "NOT_FOUND" });
      }

      await membership.deleteOne();
      return res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

teamRouter.post("/invites/accept", requireSameOrigin, async (req, res, next) => {
  try {
    const raw =
      (typeof req.body?.token === "string" && req.body.token) ||
      req.cookies?.[COOKIE.inviteToken] ||
      "";

    if (!TOKEN_RE.test(raw)) {
      return res.status(400).json({ error: "Invalid invite.", code: "INVALID_INVITE" });
    }

    const membership = await Membership.findOne({
      inviteTokenHash: hashToken(raw),
      status: "pending",
    });

    if (!membership || !membership.expiresAt || membership.expiresAt < new Date()) {
      res.clearCookie(COOKIE.inviteToken, clearCookieOptions());
      return res.status(410).json({ error: "Invite expired or invalid.", code: "INVITE_EXPIRED" });
    }

    const userEmail = String(req.user.email || "").toLowerCase();
    if (userEmail !== membership.email) {
      return res.status(403).json({
        error: `Sign in with ${membership.email} to accept this invite.`,
        code: "EMAIL_MISMATCH",
      });
    }

    membership.status = "active";
    membership.memberUserId = req.user._id;
    membership.inviteTokenHash = "";
    membership.expiresAt = null;
    await membership.save();

    res.clearCookie(COOKIE.inviteToken, clearCookieOptions());
    return res.json({
      ok: true,
      ownerUserId: String(membership.ownerUserId),
      role: membership.role,
    });
  } catch (err) {
    next(err);
  }
});
