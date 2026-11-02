import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "node:dns";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { loadEnv } from "./config/env.js";
import { connectDb } from "./db.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import { listWorkspacesForUser } from "./lib/workspaces.js";
import { authRouter } from "./routes/auth.js";
import { notificationsRouter } from "./routes/notifications.js";
import { reviewsRouter } from "./routes/reviews.js";
import { teamRouter } from "./routes/team.js";
import { youtubeRouter } from "./routes/youtube.js";

const env = loadEnv();
if (env.mongoDnsServers.length) {
  dns.setServers(env.mongoDnsServers);
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

const limiterBase = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
};
const authLimiter = rateLimit({ ...limiterBase, windowMs: 60 * 1000, limit: 20 });
const apiLimiter = rateLimit({ ...limiterBase, windowMs: 60 * 1000, limit: 60 });
const uploadLimiter = rateLimit({ ...limiterBase, windowMs: 60 * 60 * 1000, limit: 10 });
const inviteLimiter = rateLimit({ ...limiterBase, windowMs: 60 * 60 * 1000, limit: 30 });

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authLimiter, authRouter);
app.get("/api/me", apiLimiter, requireAuth, async (req, res, next) => {
  try {
    const workspaces = await listWorkspacesForUser(req.user);
    res.json({ user: req.user.toPublicJSON(), workspaces });
  } catch (err) {
    next(err);
  }
});
app.use("/api/team/invites", inviteLimiter);
app.use("/api/team", apiLimiter, teamRouter);
app.use("/api/reviews", apiLimiter, (req, res, next) => {
  const pathOnly = (req.url || "").split("?")[0];
  if (req.method === "POST" && (pathOnly === "/" || pathOnly === "")) {
    return uploadLimiter(req, res, next);
  }
  return next();
});
app.use("/api/reviews", reviewsRouter);
app.use("/api/notifications", apiLimiter, notificationsRouter);
app.use("/api/youtube", apiLimiter, youtubeRouter);

app.use(errorHandler);

async function main() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
