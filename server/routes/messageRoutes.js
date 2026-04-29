// ─── Message Routes ───────────────────────────────────────────────────────────
// Handles conversations (threads between two users about a listing) and the
// messages embedded within them.
import express from "express";
import {
  getUserConversations,
  createOrGetConversation,
  sendMessage,
  deleteConversation,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/:userId",           getUserConversations);    // GET  all conversations for a user
router.post("/thread",           createOrGetConversation); // POST create or retrieve a conversation
router.post("/:conversationId",  sendMessage);             // POST append a message to a conversation
router.delete("/:conversationId", deleteConversation);     // DELETE remove a conversation (participant only)

export default router;