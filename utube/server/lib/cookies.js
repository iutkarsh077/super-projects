import { loadEnv } from "../config/env.js";

export const COOKIE = {
  session: "sid",
  oauthState: "oauth_state",
  pkce: "pkce_verifier",
  inviteToken: "invite_token",
  oauthIntent: "oauth_intent",
};

export function cookieBase() {
  const { isProd } = loadEnv();
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
  };
}

export function sessionCookieOptions() {
  return {
    ...cookieBase(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function oauthCookieOptions() {
  return {
    ...cookieBase(),
    maxAge: 10 * 60 * 1000,
  };
}

export function clearCookieOptions() {
  return cookieBase();
}
