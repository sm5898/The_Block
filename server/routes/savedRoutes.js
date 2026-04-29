// ─── Saved Listings Routes ────────────────────────────────────────────────────
// Exposes endpoints for users to save and unsave listings.
// The savedListings array lives on the User document.
import express from "express";
import {
  getSavedListings,
  saveListing,
  removeSavedListing,
} from "../controllers/savedController.js";

const router = express.Router();

router.get("/:userId",             getSavedListings);   // GET  all saved listings for a user
router.post("/:userId/:listingId", saveListing);        // POST save a listing (idempotent)
router.delete("/:userId/:listingId", removeSavedListing); // DELETE remove a saved listing

export default router;