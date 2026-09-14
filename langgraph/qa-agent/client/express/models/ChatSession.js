import mongoose from "mongoose";

// A session is created when a user starts a new chat. Its messages are stored
// separately in Conversation and point back here through `chatSession`.
const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "New chat",
      maxlength: 200,
    },
  },
  { timestamps: true }
);

chatSessionSchema.index({ user: 1, updatedAt: -1 });

const ChatSession = mongoose.models.ChatSession || mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;
