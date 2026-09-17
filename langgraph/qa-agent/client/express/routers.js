import { Router } from "express";
import { authenticate } from "./controllers/authController.js";
import QueryNode from "./controllers/QueryNode.js";
import { getChatSessions } from "./controllers/chatSessionController.js";
import GetChatUsingSession from "./controllers/GetChats.js";
import multer from "multer";
import UploadMultipleFiles from "./controllers/UploadFiles.js";

const router = Router();

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

const upload = multer({ storage: storage });

router.post("/auth", authenticate);
router.post("/querynode", QueryNode);
router.get("/chat-sessions/:userId", getChatSessions);
router.get("/getchats/:id", GetChatUsingSession);

router.post("/uploadfiles", upload.array('files', 10), UploadMultipleFiles)

export default router;
