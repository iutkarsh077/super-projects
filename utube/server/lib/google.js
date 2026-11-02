import crypto from "node:crypto";
import { google } from "googleapis";
import { loadEnv } from "../config/env.js";
import { decrypt } from "./crypto.js";

export const PROFILE_SCOPES = ["openid", "email", "profile"];

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.upload",
];

export const GOOGLE_SCOPES = [...PROFILE_SCOPES, ...YOUTUBE_SCOPES];

export function createOAuthClient() {
  const { googleClientId, googleClientSecret, redirectUri } = loadEnv();
  return new google.auth.OAuth2(googleClientId, googleClientSecret, redirectUri);
}

export function createPkce() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function randomState() {
  return crypto.randomBytes(32).toString("hex");
}

export function authClientFromRefreshToken(refreshToken) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export function youtubeClientFromEncryptedToken(refreshTokenEnc) {
  const refreshToken = decrypt(refreshTokenEnc);
  const auth = authClientFromRefreshToken(refreshToken);
  return {
    auth,
    youtube: google.youtube({ version: "v3", auth }),
  };
}

export async function getGoogleProfile(auth) {
  const oauth2 = google.oauth2({ version: "v2", auth });
  const { data } = await oauth2.userinfo.get();
  return data;
}
