import { loadEnv } from "../config/env.js";

export function requireSameOrigin(req, res, next) {
  const { clientOrigin } = loadEnv();
  const origin = req.get("origin");
  if (origin && origin === clientOrigin) {
    return next();
  }
  return res.status(403).json({ error: "Invalid request origin.", code: "CSRF_ORIGIN" });
}
