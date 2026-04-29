// ─── Listing Routes ───────────────────────────────────────────────────────────
// Handles full CRUD for Listing documents. Image uploads use multer middleware
// with disk storage — files land in server/uploads/ and are served as static assets.
import express from "express";
import multer  from "multer";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";

const router = express.Router();

// ── Multer disk-storage configuration ────────────────────────────────────────
const storage = multer.diskStorage({
  // Store uploaded files in the /uploads directory relative to the server root
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // Prefix filename with a timestamp to prevent collisions
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ── Routes ────────────────────────────────────────────────────────────────────
router.get("/",    getListings);                         // GET  all listings (with optional filters)
router.get("/:id", getListingById);                      // GET  a single listing by ID
router.post("/",   upload.single("image"), createListing); // POST create listing (multipart/form-data)
router.put("/:id", updateListing);                       // PUT  update listing fields
router.delete("/:id", deleteListing);                    // DELETE remove a listing

export default router;