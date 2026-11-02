import mongoose from "mongoose";
import { Router } from "express";
import { youtubeClientFromEncryptedToken } from "../lib/google.js";
import {
  buildReviewObjectKey,
  createPresignedGetUrl,
  createPresignedPutUrl,
  deleteReviewObject,
  getReviewObjectStream,
  headReviewObject,
  isS3Configured,
  S3_MAX_BYTES,
} from "../lib/s3.js";
import { mapGoogleError } from "../lib/youtubeErrors.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSameOrigin } from "../middleware/csrfOrigin.js";
import { requireOwnerRole, requireWorkspace } from "../middleware/workspace.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { VideoSubmission } from "../models/VideoSubmission.js";

export const reviewsRouter = Router();

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
]);
const TITLE_MAX = 100;
const DESC_MAX = 5000;
const NOTES_MAX = 2000;
const PRIVACY = new Set(["private", "unlisted", "public"]);

reviewsRouter.use(requireAuth, requireWorkspace);

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

function submissionToPublic(doc, { uploaderName = "" } = {}) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    privacyStatus: doc.privacyStatus,
    status: doc.status,
    contentType: doc.contentType,
    byteSize: doc.byteSize,
    reviewNotes: doc.reviewNotes || "",
    youtubeVideoId: doc.youtubeVideoId || null,
    uploadedByUserId: String(doc.uploadedByUserId),
    uploadedByRole: doc.uploadedByRole,
    uploadedByName: uploaderName,
    submittedAt: doc.submittedAt,
    reviewedAt: doc.reviewedAt,
    createdAt: doc.createdAt,
  };
}

reviewsRouter.post("/", requireSameOrigin, async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(503).json({
        error: "Video review storage is not configured.",
        code: "S3_NOT_CONFIGURED",
      });
    }

    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const description =
      typeof req.body?.description === "string" ? req.body.description : "";
    const privacyStatus = PRIVACY.has(req.body?.privacyStatus)
      ? req.body.privacyStatus
      : "private";
    const contentType = String(req.body?.contentType || "").trim();
    const fileName = String(req.body?.fileName || "video").trim();

    if (!title || title.length > TITLE_MAX) {
      return res.status(400).json({
        error: "Title must be 1–100 characters.",
        code: "INVALID_TITLE",
      });
    }
    if (description.length > DESC_MAX) {
      return res.status(400).json({
        error: "Description must be at most 5000 characters.",
        code: "INVALID_DESCRIPTION",
      });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return res.status(400).json({
        error: "Upload a mp4, mov, webm, or mkv file.",
        code: "INVALID_FILE",
      });
    }

    const owner = req.workspace.owner;
    const submission = await VideoSubmission.create({
      ownerUserId: owner._id,
      uploadedByUserId: req.user._id,
      uploadedByRole: req.workspace.role,
      title: title.slice(0, TITLE_MAX),
      description: description.slice(0, DESC_MAX),
      privacyStatus,
      contentType,
      status: "awaiting_file",
    });

    const s3Key = buildReviewObjectKey(owner._id, submission._id, fileName);
    submission.s3Key = s3Key;
    await submission.save();

    const { uploadUrl } = await createPresignedPutUrl({
      key: s3Key,
      contentType,
    });

    return res.status(201).json({
      id: String(submission._id),
      uploadUrl,
      contentType,
    });
  } catch (err) {
    if (err?.code === "S3_NOT_CONFIGURED") {
      return res.status(503).json({
        error: "Video review storage is not configured.",
        code: "S3_NOT_CONFIGURED",
      });
    }
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});

reviewsRouter.post("/:id/complete", requireSameOrigin, async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(503).json({
        error: "Video review storage is not configured.",
        code: "S3_NOT_CONFIGURED",
      });
    }

    const id = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
    }

    const ownerId = req.workspace.owner._id;
    const submission = await VideoSubmission.findOne({
      _id: id,
      ownerUserId: ownerId,
    });
    if (!submission) {
      return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
    }
    if (String(submission.uploadedByUserId) !== String(req.user._id)) {
      return res.status(403).json({
        error: "Only the uploader can complete this submission.",
        code: "FORBIDDEN",
      });
    }

    if (submission.status === "pending_review") {
      return res.json({ submission: submissionToPublic(submission) });
    }
    if (submission.status !== "awaiting_file") {
      return res.status(409).json({
        error: "Submission is not awaiting a file.",
        code: "INVALID_STATUS",
      });
    }

    const head = await headReviewObject(submission.s3Key);
    if (!head.contentLength || head.contentLength > S3_MAX_BYTES) {
      return res.status(400).json({
        error: "Video is too large (max 256MB) or missing.",
        code: "FILE_TOO_LARGE",
      });
    }
    const headType = String(head.contentType || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (headType && headType !== String(submission.contentType || "").toLowerCase()) {
      return res.status(400).json({
        error: "Uploaded file type does not match.",
        code: "INVALID_FILE",
      });
    }

    const updated = await VideoSubmission.findOneAndUpdate(
      {
        _id: submission._id,
        ownerUserId: ownerId,
        status: "awaiting_file",
      },
      {
        $set: {
          status: "pending_review",
          byteSize: head.contentLength,
          submittedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updated) {
      const again = await VideoSubmission.findById(submission._id);
      if (again?.status === "pending_review") {
        return res.json({ submission: submissionToPublic(again) });
      }
      return res.status(409).json({
        error: "Submission could not be marked complete.",
        code: "INVALID_STATUS",
      });
    }

    return res.json({ submission: submissionToPublic(updated) });
  } catch (err) {
    if (err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
      return res.status(400).json({
        error: "Video file was not found in storage. Upload again.",
        code: "MISSING_FILE",
      });
    }
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});

reviewsRouter.get("/", async (req, res) => {
  try {
    const ownerId = req.workspace.owner._id;
    const userId = req.user._id;

    const pending = await VideoSubmission.find({
      ownerUserId: ownerId,
      status: { $in: ["pending_review", "publishing"] },
    })
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(50);

    const rejected = await VideoSubmission.find({
      ownerUserId: ownerId,
      status: "rejected",
      uploadedByUserId: userId,
    })
      .sort({ reviewedAt: -1, createdAt: -1 })
      .limit(50);

    const uploaderIds = [
      ...new Set(
        [...pending, ...rejected].map((s) => String(s.uploadedByUserId)),
      ),
    ];
    const uploaders = await User.find({ _id: { $in: uploaderIds } }).select(
      "name email",
    );
    const nameById = new Map(
      uploaders.map((u) => [String(u._id), u.name || u.email || ""]),
    );

    return res.json({
      pending: pending.map((s) =>
        submissionToPublic(s, { uploaderName: nameById.get(String(s.uploadedByUserId)) }),
      ),
      rejected: rejected.map((s) =>
        submissionToPublic(s, { uploaderName: nameById.get(String(s.uploadedByUserId)) }),
      ),
    });
  } catch (err) {
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});

reviewsRouter.get("/:id/playback", async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(503).json({
        error: "Video review storage is not configured.",
        code: "S3_NOT_CONFIGURED",
      });
    }

    const id = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
    }

    const submission = await VideoSubmission.findOne({
      _id: id,
      ownerUserId: req.workspace.owner._id,
    });
    if (!submission) {
      return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
    }
    if (submission.status !== "pending_review" && submission.status !== "publishing") {
      return res.status(409).json({
        error: "Playback is only available while the video is in review.",
        code: "INVALID_STATUS",
      });
    }

    const { playbackUrl, expiresIn } = await createPresignedGetUrl({
      key: submission.s3Key,
      contentType: submission.contentType,
    });
    return res.json({ playbackUrl, expiresIn });
  } catch (err) {
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});

reviewsRouter.post(
  "/:id/publish",
  requireSameOrigin,
  requireOwnerRole,
  (req, res, next) => {
    req.setTimeout(30 * 60 * 1000);
    res.setTimeout(30 * 60 * 1000);
    next();
  },
  async (req, res) => {
    let lockedId = null;
    try {
      if (!isS3Configured()) {
        return res.status(503).json({
          error: "Video review storage is not configured.",
          code: "S3_NOT_CONFIGURED",
        });
      }

      const id = String(req.params.id || "");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
      }

      const owner = req.workspace.owner;
      const locked = await VideoSubmission.findOneAndUpdate(
        {
          _id: id,
          ownerUserId: owner._id,
          status: "pending_review",
        },
        { $set: { status: "publishing" } },
        { new: true },
      );

      if (!locked) {
        const existing = await VideoSubmission.findOne({
          _id: id,
          ownerUserId: owner._id,
        });
        if (!existing) {
          return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
        }
        return res.status(409).json({
          error: "Submission is not ready to publish.",
          code: "INVALID_STATUS",
        });
      }
      lockedId = locked._id;

      const stream = await getReviewObjectStream(locked.s3Key);
      const youtube = youtubeFor(owner);
      const inserted = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: locked.title || "Untitled upload",
            description: locked.description || "",
          },
          status: {
            privacyStatus: locked.privacyStatus || "private",
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: stream,
        },
      });

      const item = inserted.data;
      const youtubeVideoId = item.id;

      await VideoSubmission.findOneAndUpdate(
        { _id: locked._id },
        {
          $set: {
            status: "published",
            youtubeVideoId,
            reviewedAt: new Date(),
            s3Key: "",
          },
        },
      );

      try {
        await deleteReviewObject(locked.s3Key);
      } catch (delErr) {
        console.error("Failed to delete S3 object after publish:", delErr?.message || delErr);
      }

      return res.status(201).json({
        video: {
          id: item.id,
          title: item.snippet?.title || locked.title,
          description: item.snippet?.description || locked.description,
          thumbnail:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            "",
          privacyStatus: item.status?.privacyStatus || locked.privacyStatus,
          publishedAt: item.snippet?.publishedAt || null,
        },
        submissionId: String(locked._id),
      });
    } catch (err) {
      if (lockedId) {
        await VideoSubmission.findOneAndUpdate(
          { _id: lockedId, status: "publishing" },
          { $set: { status: "pending_review" } },
        ).catch(() => {});
      }
      return sendGoogleError(req, res, err);
    }
  },
);

reviewsRouter.post("/:id/reject", requireSameOrigin, requireOwnerRole, async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
    }

    const notes =
      typeof req.body?.notes === "string" ? req.body.notes.trim() : "";
    if (!notes || notes.length > NOTES_MAX) {
      return res.status(400).json({
        error: "Review notes are required (max 2000 characters).",
        code: "INVALID_NOTES",
      });
    }

    const owner = req.workspace.owner;
    const locked = await VideoSubmission.findOneAndUpdate(
      {
        _id: id,
        ownerUserId: owner._id,
        status: "pending_review",
      },
      {
        $set: {
          status: "rejected",
          reviewNotes: notes.slice(0, NOTES_MAX),
          reviewedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!locked) {
      const existing = await VideoSubmission.findOne({
        _id: id,
        ownerUserId: owner._id,
      });
      if (!existing) {
        return res.status(404).json({ error: "Submission not found.", code: "NOT_FOUND" });
      }
      return res.status(409).json({
        error: "Submission is not ready to reject.",
        code: "INVALID_STATUS",
      });
    }

    const s3Key = locked.s3Key;
    if (s3Key) {
      try {
        if (isS3Configured()) {
          await deleteReviewObject(s3Key);
        }
      } catch (delErr) {
        console.error("Failed to delete S3 object after reject:", delErr?.message || delErr);
      }
      locked.s3Key = "";
      await locked.save();
    }

    await Notification.create({
      userId: locked.uploadedByUserId,
      ownerUserId: owner._id,
      submissionId: locked._id,
      type: "revision_requested",
      title: locked.title,
      notes: locked.reviewNotes,
    });

    return res.json({
      submission: submissionToPublic(locked),
    });
  } catch (err) {
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});
