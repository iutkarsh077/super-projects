import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" },
    youtubeChannelId: { type: String, default: "" },
    youtubeChannelTitle: { type: String, default: "" },
    uploadsPlaylistId: { type: String, default: "" },
    refreshTokenEnc: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    picture: this.picture,
    youtubeChannelId: this.youtubeChannelId || null,
    youtubeChannelTitle: this.youtubeChannelTitle || null,
    hasYouTubeChannel: Boolean(this.youtubeChannelId),
  };
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
