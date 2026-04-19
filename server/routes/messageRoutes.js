import express from "express";
import {
  getUserConversations,
  createOrGetConversation,
  sendMessage,
  deleteConversation,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/:userId", getUserConversations);
router.post("/thread", createOrGetConversation);
router.post("/:conversationId", sendMessage);
router.delete("/:conversationId", deleteConversation);

export default router;