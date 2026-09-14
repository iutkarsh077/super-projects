import axios from "axios";
import mongoose from "mongoose";
import ChatSession from "../models/ChatSession.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

const QueryNode = async (req, res) => {
    try {
        const { query, userId, chatSessionId } = req.body;

        const question = query?.trim();
        if (!question || !userId) {
            return res.status(400).json({ error: "query and userId are required", status: false });
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(404).json({ error: "User not found", status: false });
        }

        const user = await User.findById(userId).select("email").lean();
        if (!user) {
            return res.status(404).json({ error: "User not found", status: false });
        }

        let chatSession;
        if (chatSessionId) {
            if (!mongoose.isValidObjectId(chatSessionId)) {
                return res.status(400).json({ error: "Invalid chatSessionId", status: false });
            }

            chatSession = await ChatSession.findOne({ _id: chatSessionId, user: userId });
            if (!chatSession) {
                return res.status(404).json({ error: "Chat session not found", status: false });
            }
        } else {
            chatSession = await ChatSession.create({
                user: userId,
                title: question.slice(0, 50),
            });
        }

        await Conversation.create({
            chatSession: chatSession._id,
            role: "user",
            content: question,
        });

        console.log("Query is: ", question)

        const fastapi = process.env.FASTAPI_ORIGIN;
        const response = await axios.post(`${fastapi}/query`, {
            question,
            chatSessionId: chatSession._id.toString(),
            userId: user._id.toString(),
            email: user.email,
        });
        const answer = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

        await Conversation.create({
            chatSession: chatSession._id,
            role: "assistant",
            content: answer,
        });

        await ChatSession.updateOne({ _id: chatSession._id }, { $set: { updatedAt: new Date() } });


        console.log("Fast api response is: ", response.data, "status is: ", response.status, "headrr is: ", response.headers);
        return res.status(200).json({ data: response.data, chatSessionId: chatSession._id, status: true });
    } catch (error) {
        // console.log(error)
        return res.status(500).json({ error: error.message, status: false });
    }
};

export default QueryNode;
