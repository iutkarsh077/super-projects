import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env.js";
import { COOKIE } from "../lib/cookies.js";
import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE.session];
    if (!token) {
      return res.status(401).json({ error: "Not signed in.", code: "UNAUTHENTICATED" });
    }

    const { jwtSecret } = loadEnv();
    const payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Not signed in.", code: "UNAUTHENTICATED" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Not signed in.", code: "UNAUTHENTICATED" });
  }
}
