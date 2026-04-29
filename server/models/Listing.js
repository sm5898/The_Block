// ─── Listing Model ────────────────────────────────────────────────────────────
// Represents an item/service posted by a user. Listings have a type enum to
// distinguish borrowable items from offered services.
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Type controls the card border colour and filter behaviour on the frontend
    type: {
      type: String,
      required: true,
      enum: ["borrow", "service", "lend"], // Enforced at the schema level
    },
    company: {
      type: String,
      default: "",
      trim: true, // Optional brand/company name for the item
    },
    image: {
      type: String,
      default: "",
      trim: true, // Relative path under /uploads, e.g. "/uploads/1234-drill.jpg"
    },
    availability: {
      type: String,
      required: true,
      trim: true, // Free-text, e.g. "Weekends only" or a formatted date range
    },
    // Flat lat/lng object — avoids GeoJSON complexity for this use case
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    // Display name of the creator (used for filtering on the profile page)
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional ObjectId ref to the User document for richer queries
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.model("Listing", listingSchema);