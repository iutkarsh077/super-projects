import mongoose from "mongoose";

export const NOTIFICATION_TYPES = ["revision_requested"];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoSubmission",
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "revision_requested",
    },
    title: { type: String, required: true },
    notes: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, ownerUserId: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
