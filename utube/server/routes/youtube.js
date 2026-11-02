import { Router } from "express";
import { youtubeClientFromEncryptedToken } from "../lib/google.js";
import { mapGoogleError } from "../lib/youtubeErrors.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSameOrigin } from "../middleware/csrfOrigin.js";
import { requireOwnerRole, requireWorkspace } from "../middleware/workspace.js";

export const youtubeRouter = Router();

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const TITLE_MAX = 100;
const DESC_MAX = 5000;
const PRIVACY = new Set(["private", "unlisted", "public"]);

function youtubeFor(owner) {
  if (!owner.refreshTokenEnc) {
    const err = new Error("invalid_grant");
    err.code = 401;
    throw err;
  }
  return youtubeClientFromEncryptedToken(owner.refreshTokenEnc).youtube;
}

function sendGoogleError(req, res, err) {
  const asStaff = req.workspace?.role && req.workspace.role !== "owner";
  const mapped = mapGoogleError(err, { asStaff });
  return res.status(mapped.status).json(mapped.body);
}

youtubeRouter.use(requireAuth, requireWorkspace);

youtubeRouter.get("/videos", async (req, res) => {
  try {
    const owner = req.workspace.owner;
    if (!owner.uploadsPlaylistId) {
      return res.json({ videos: [], nextPageToken: null, needsChannel: true });
    }

    const youtube = youtubeFor(owner);
    const playlist = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: owner.uploadsPlaylistId,
      maxResults: 12,
      pageToken: req.query.pageToken || undefined,
    });

    const ids = (playlist.data.items || [])
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean);

    if (!ids.length) {
      return res.json({
        videos: [],
        nextPageToken: playlist.data.nextPageToken || null,
        needsChannel: false,
      });
    }

    const details = await youtube.videos.list({
      part: ["snippet", "status", "statistics"],
      id: ids,
    });

    const videos = (details.data.items || []).map((video) => ({
      id: video.id,
      title: video.snippet?.title || "",
      description: video.snippet?.description || "",
      thumbnail:
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",
      privacyStatus: video.status?.privacyStatus || "private",
      publishedAt: video.snippet?.publishedAt || null,
      viewCount: Number(video.statistics?.viewCount || 0),
      likeCount: Number(video.statistics?.likeCount || 0),
    }));

    return res.json({
      videos,
      nextPageToken: playlist.data.nextPageToken || null,
      needsChannel: false,
    });
  } catch (err) {
    return sendGoogleError(req, res, err);
  }
});

youtubeRouter.patch("/videos/:id", requireSameOrigin, async (req, res) => {
  try {
    const videoId = String(req.params.id || "");
    if (!VIDEO_ID_RE.test(videoId)) {
      return res.status(400).json({ error: "Invalid video id.", code: "INVALID_VIDEO_ID" });
    }

    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const description =
      typeof req.body?.description === "string" ? req.body.description : "";
    const privacyStatus = req.body?.privacyStatus;

    if (!title || title.length > TITLE_MAX) {
      return res.status(400).json({ error: "Title must be 1–100 characters.", code: "INVALID_TITLE" });
    }
    if (description.length > DESC_MAX) {
      return res.status(400).json({
        error: "Description must be at most 5000 characters.",
        code: "INVALID_DESCRIPTION",
      });
    }
    if (privacyStatus && !PRIVACY.has(privacyStatus)) {
      return res.status(400).json({ error: "Invalid privacy status.", code: "INVALID_PRIVACY" });
    }

    const youtube = youtubeFor(req.workspace.owner);
    const existing = await youtube.videos.list({
      part: ["snippet", "status"],
      id: [videoId],
    });
    const video = existing.data.items?.[0];
    if (!video) {
      return res.status(404).json({ error: "Video not found.", code: "NOT_FOUND" });
    }

    const snippet = video.snippet || {};
    snippet.title = title;
    snippet.description = description;

    const status = video.status || {};
    if (privacyStatus) status.privacyStatus = privacyStatus;

    const updated = await youtube.videos.update({
      part: ["snippet", "status"],
      requestBody: {
        id: videoId,
        snippet,
        status,
      },
    });

    const item = updated.data;
    return res.json({
      video: {
        id: item.id,
        title: item.snippet?.title || title,
        description: item.snippet?.description || description,
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        privacyStatus: item.status?.privacyStatus || status.privacyStatus,
        publishedAt: item.snippet?.publishedAt || null,
      },
    });
  } catch (err) {
    return sendGoogleError(req, res, err);
  }
});

youtubeRouter.delete(
  "/videos/:id",
  requireSameOrigin,
  requireOwnerRole,
  async (req, res) => {
    try {
      const videoId = String(req.params.id || "");
      if (!VIDEO_ID_RE.test(videoId)) {
        return res.status(400).json({ error: "Invalid video id.", code: "INVALID_VIDEO_ID" });
      }

      const youtube = youtubeFor(req.workspace.owner);
      await youtube.videos.delete({ id: videoId });
      return res.json({ ok: true, id: videoId });
    } catch (err) {
      return sendGoogleError(req, res, err);
    }
  },
);

youtubeRouter.post("/upload", requireSameOrigin, (_req, res) => {
  return res.status(410).json({
    error:
      "Direct YouTube upload is retired. Submit the video for owner review first.",
    code: "REVIEW_REQUIRED",
  });
});
