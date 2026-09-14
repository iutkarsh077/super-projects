import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema(
  {
    chatSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Fetch a session's messages in their original order efficiently.
conversationSchema.index({ chatSession: 1, createdAt: 1 });

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;
