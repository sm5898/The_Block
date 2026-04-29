// ─── Saved Listings Controller ────────────────────────────────────────────────
// Manages the array of listing ObjectIds stored on the User document.
// Users can save listings for quick access and remove them later.
import mongoose from "mongoose";
import User from "../models/User.js";
import Listing from "../models/Listing.js";

// ── GET /api/saved/:userId ────────────────────────────────────────────────────
// Returns all full listing documents that the user has saved.
// Uses Mongoose populate to replace ObjectId refs with actual Listing data.
export const getSavedListings = async (req, res) => {
  try {
    // Guard against malformed IDs before hitting the DB
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.userId).populate("savedListings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.savedListings);
  } catch (error) {
    console.error("GET SAVED LISTINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch saved listings" });
  }
};

// ── POST /api/saved/:userId/:listingId ────────────────────────────────────────
// Adds a listing to the user's saved list. Idempotent — saving an already-saved
// listing is a no-op rather than an error.
export const saveListing = async (req, res) => {
  try {
    const { userId, listingId } = req.params;

    // Validate both IDs before any DB queries
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid user or listing ID" });
    }

    const user    = await User.findById(userId);
    const listing = await Listing.findById(listingId);

    if (!user)    return res.status(404).json({ message: "User not found" });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Only add the listing if it isn't already in the saved array
    const alreadySaved = user.savedListings.some(
      (id) => id.toString() === listingId
    );

    if (!alreadySaved) {
      user.savedListings.push(listingId);
      await user.save();
    }

    res.status(200).json({
      message: "Listing saved successfully",
      savedListings: user.savedListings,
    });
  } catch (error) {
    console.error("SAVE LISTING ERROR:", error);
    res.status(500).json({ message: "Failed to save listing" });
  }
};

// ── DELETE /api/saved/:userId/:listingId ──────────────────────────────────────
// Removes a listing ObjectId from the user's savedListings array.
export const removeSavedListing = async (req, res) => {
  try {
    const { userId, listingId } = req.params;

    // Validate both IDs before any DB queries
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid user or listing ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter out the listing ID to remove it from the array
    user.savedListings = user.savedListings.filter(
      (id) => id.toString() !== listingId
    );

    await user.save();

    res.status(200).json({
      message: "Listing removed from saved successfully",
      savedListings: user.savedListings,
    });
  } catch (error) {
    console.error("REMOVE SAVED LISTING ERROR:", error);
    res.status(500).json({ message: "Failed to remove saved listing" });
  }
};