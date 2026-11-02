import mongoose from "mongoose";

export const SUBMISSION_STATUSES = [
  "awaiting_file",
  "pending_review",
  "publishing",
  "published",
  "rejected",
];

export const PRIVACY_STATUSES = ["private", "unlisted", "public"];

const videoSubmissionSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploadedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploadedByRole: { type: String, required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 5000 },
    privacyStatus: {
      type: String,
      enum: PRIVACY_STATUSES,
      default: "private",
    },
    s3Key: { type: String, default: "" },
    contentType: { type: String, default: "" },
    byteSize: { type: Number, default: null },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: "awaiting_file",
      index: true,
    },
    reviewNotes: { type: String, default: "" },
    youtubeVideoId: { type: String, default: "" },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

videoSubmissionSchema.index({ ownerUserId: 1, status: 1, createdAt: -1 });

export const VideoSubmission =
  mongoose.models.VideoSubmission ||
  mongoose.model("VideoSubmission", videoSubmissionSchema);
