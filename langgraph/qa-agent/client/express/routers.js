import { Router } from "express";
import { authenticate } from "./controllers/authController.js";
import QueryNode from "./controllers/QueryNode.js";
import { getChatSessions } from "./controllers/chatSessionController.js";
import GetChatUsingSession from "./controllers/GetChats.js";

const router = Router();

router.post("/auth", authenticate);
router.post("/querynode", QueryNode);
router.get("/chat-sessions/:userId", getChatSessions);
router.get("/getchats/:id", GetChatUsingSession);

export default router;
