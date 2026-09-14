import mongoose from "mongoose";
import ChatSession from "../models/ChatSession.js";

export const getChatSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid userId", status: false });
    }

    const sessions = await ChatSession.find({ user: userId })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ data: sessions, status: true });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: false });
  }
};
