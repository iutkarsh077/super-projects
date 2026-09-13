import { Router } from "express";
import { authenticate } from "./controllers/authController.js";
import QueryNode from "./controllers/QueryNode.js";

const router = Router();

router.post("/auth", authenticate);
router.post("/querynode", QueryNode);

export default router;
