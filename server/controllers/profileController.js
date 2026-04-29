// ─── Profile Controller ───────────────────────────────────────────────────────
// Handles reading and updating the authenticated user's profile.
// All routes here are protected by the requireAuth middleware, which injects
// req.userId from the verified JWT.
import User from "../models/User.js";
import Listing from "../models/Listing.js";

// ── GET /api/profile/me ───────────────────────────────────────────────────────
// Returns the current user's profile fields (excluding the hashed password),
// their listing count, and their three most recent listings for the profile cards.
export const getProfile = async (req, res) => {
  try {
    // Exclude the password field from the response for security
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Count total listings created by this user (keyed on firstName string)
    const listingCount = await Listing.countDocuments({ createdBy: user.firstName });

    // Fetch the most recent listings to display on the profile page
    const myListings = await Listing.find({ createdBy: user.firstName })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      user,
      stats: { listingCount },
      myListings,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// ── PUT /api/profile/me ───────────────────────────────────────────────────────
// Selectively updates the user's editable profile fields.
// Only fields present in the request body are overwritten — untouched fields
// are left as-is, which prevents accidentally clearing data.
export const updateProfile = async (req, res) => {
  try {
    const { bio, location, photo, firstName, lastName } = req.body;

    // Build the update object with only the fields that were actually sent
    const updates = {};
    if (bio        !== undefined) updates.bio       = bio;
    if (location   !== undefined) updates.location  = location;
    if (photo      !== undefined) updates.photo     = photo;
    if (firstName  !== undefined) updates.firstName = firstName;
    if (lastName   !== undefined) updates.lastName  = lastName;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true } // Return updated doc; apply schema validators
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
