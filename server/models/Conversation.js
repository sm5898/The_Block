// ─── Conversation Model ───────────────────────────────────────────────────────
// A Conversation ties two participants to a listing context and stores all
// messages as an embedded sub-document array (no separate Message collection).
// This keeps queries simple — one document fetch returns the full thread.
import mongoose from "mongoose";

// Embedded schema for individual chat messages
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Must know who sent the message
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // createdAt on each message acts as the send timestamp
);

const conversationSchema = new mongoose.Schema(
  {
    // Exactly two participants — validated at the controller level ($size: 2)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // The listing that prompted this conversation (for display context)
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    // Embedded array — grows with each new message; no separate collection needed
    messages: [messageSchema],
  },
  { timestamps: true } // updatedAt used to sort conversations by most recent activity
);

export default mongoose.model("Conversation", conversationSchema);