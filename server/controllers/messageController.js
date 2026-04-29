// ─── Message Controller ───────────────────────────────────────────────────────
// Manages Conversation documents (participants, linked listing, embedded messages).
// Conversations are identified by a pair of user IDs + a listing — creating one
// is idempotent: a second call with the same participants returns the existing doc.
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";

// ── GET /api/messages/:userId ─────────────────────────────────────────────────
// Returns all conversations the user is a participant in, newest first.
// Populates participant names and the linked listing for display in the sidebar.
export const getUserConversations = async (req, res) => {
  try {
    // Guard against malformed IDs before hitting the DB
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const conversations = await Conversation.find({
      participants: req.params.userId,
    })
      .populate("participants", "firstName lastName email")
      .populate("listingId", "title createdBy image")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("GET USER CONVERSATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// ── POST /api/messages/thread ─────────────────────────────────────────────────
// Creates a new conversation between two users about a listing, or returns the
// existing one if it already exists. This makes the endpoint idempotent.
export const createOrGetConversation = async (req, res) => {
  try {
    const { senderId, recipientId, listingId } = req.body;

    // All three identifiers are required to create a meaningful conversation
    if (!senderId || !recipientId || !listingId) {
      return res.status(400).json({
        message: "senderId, recipientId, and listingId are required",
      });
    }

    // Validate ID formats before DB queries
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(listingId)
    ) {
      return res.status(400).json({ message: "One or more IDs are invalid" });
    }

    // Verify all referenced documents actually exist
    const sender    = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
    const listing   = await Listing.findById(listingId);

    if (!sender || !recipient || !listing) {
      return res.status(404).json({ message: "Sender, recipient, or listing not found" });
    }

    // Look for an existing conversation between exactly these two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 },
    })
      .populate("participants", "firstName lastName email")
      .populate("listingId", "title createdBy image");

    // If none exists, create a fresh one with an empty messages array
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        listingId,
        messages: [],
      });

      // Re-fetch with populated fields so the response matches the GET format
      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "firstName lastName email")
        .populate("listingId", "title createdBy image");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("CREATE OR GET CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Failed to create or fetch conversation" });
  }
};

// ── POST /api/messages/:conversationId ───────────────────────────────────────
// Appends a new message to the conversation's embedded messages array.
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, text } = req.body;

    // Validate required fields
    if (!senderId || !text?.trim()) {
      return res.status(400).json({ message: "senderId and text are required" });
    }

    // Guard against malformed IDs
    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid conversationId or senderId" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Push the new message into the embedded array; Mongoose timestamps it automatically
    conversation.messages.push({
      senderId: new mongoose.Types.ObjectId(senderId),
      text: text.trim(),
    });

    await conversation.save();

    // Return the fully populated conversation so the client can update state in one step
    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "firstName lastName email")
      .populate("listingId", "title createdBy image");

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// ── DELETE /api/messages/:conversationId ──────────────────────────────────────
// Permanently deletes a conversation. Only a participant can delete it.
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Guard against malformed IDs
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Authorisation check — only participants may delete the conversation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Conversation.findByIdAndDelete(conversationId);
    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("DELETE CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};
