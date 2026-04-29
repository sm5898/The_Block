// ─── Listing Controller ───────────────────────────────────────────────────────
// Full CRUD operations for Listing documents. Image uploads are handled by
// the multer middleware configured in listingRoutes.js and stored in /uploads.
import mongoose from "mongoose";
import Listing from "../models/Listing.js";

// ── GET /api/listings ─────────────────────────────────────────────────────────
// Returns all listings, newest first. Supports optional query-string filters:
//   ?type=borrow|lend|service  — filter by listing type
//   ?search=<term>             — case-insensitive search on title/description/company
//   ?availability=<term>       — filter by availability string
export const getListings = async (req, res) => {
  try {
    const { type, search, availability } = req.query;

    const filter = {};

    // Only apply type filter when a specific type is requested
    if (type && type !== "all") {
      filter.type = type.toLowerCase();
    }

    // Partial, case-insensitive match on availability string
    if (availability) {
      filter.availability = { $regex: availability, $options: "i" };
    }

    // Full-text style search across title, description, and company name
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { company:     { $regex: search, $options: "i" } },
      ];
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    console.error("GET LISTINGS ERROR:", error);
    res.status(500).json({ message: "Error fetching listings", error: error.message });
  }
};

// ── GET /api/listings/:id ─────────────────────────────────────────────────────
// Returns a single listing by its MongoDB ObjectId.
export const getListingById = async (req, res) => {
  try {
    // Guard against malformed IDs that would throw a CastError in Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("GET LISTING BY ID ERROR:", error);
    res.status(500).json({ message: "Error fetching listing", error: error.message });
  }
};

// ── POST /api/listings ────────────────────────────────────────────────────────
// Creates a new listing. Expects multipart/form-data so an optional image file
// can be submitted alongside the JSON fields.
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      company,
      availability,
      createdBy,
      createdById,
    } = req.body;

    // Build the image path relative to the server root if a file was uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    // Location is sent as a JSON string from the frontend form
    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch {
      return res.status(400).json({ message: "Location must be valid JSON" });
    }

    // Enforce all required fields before attempting a DB write
    if (
      !title || !description || !type || !availability || !createdBy ||
      !location || location.lat === undefined || location.lng === undefined
    ) {
      return res.status(400).json({
        message: "Missing required fields: title, description, type, availability, location (lat/lng), createdBy",
      });
    }

    const newListing = new Listing({
      title,
      description,
      type: type.toLowerCase(),
      company,
      image,
      availability,
      location,
      createdBy,
      createdById: createdById || null,
    });

    const savedListing = await newListing.save();

    res.status(201).json(savedListing);
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error);
    res.status(500).json({ message: "Error creating listing", error: error.message });
  }
};

// ── PUT /api/listings/:id ─────────────────────────────────────────────────────
// Updates an existing listing. Runs Mongoose validators on the updated fields.
export const updateListing = async (req, res) => {
  try {
    // Guard against malformed IDs
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the updated doc; apply schema validators
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    console.error("UPDATE LISTING ERROR:", error);
    res.status(500).json({ message: "Error updating listing", error: error.message });
  }
};

// ── DELETE /api/listings/:id ──────────────────────────────────────────────────
// Permanently removes a listing document from the database.
export const deleteListing = async (req, res) => {
  try {
    // Guard against malformed IDs
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }

    const deletedListing = await Listing.findByIdAndDelete(req.params.id);

    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("DELETE LISTING ERROR:", error);
    res.status(500).json({ message: "Error deleting listing", error: error.message });
  }
};