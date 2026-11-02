import mongoose from "mongoose";

const ROLES = ["video_editor", "content_writer"];
const STATUSES = ["pending", "active"];

const membershipSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memberUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, required: true },
    status: { type: String, enum: STATUSES, default: "pending", index: true },
    inviteTokenHash: { type: String, default: "" },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

membershipSchema.index({ ownerUserId: 1, email: 1 }, { unique: true });

export const MEMBERSHIP_ROLES = ROLES;
export const Membership =
  mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
