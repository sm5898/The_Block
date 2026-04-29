// ─── User Model ───────────────────────────────────────────────────────────────
// Represents a registered user. Passwords are stored as bcrypt hashes — never
// return the password field to the client (use .select("-password")).
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,  // Enforced at the DB index level
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // Stored as a bcrypt hash — never plaintext
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300, // Keep bios short for display purposes
    },
    location: {
      type: String,
      default: "",
      trim: true,   // Free-text neighborhood name, e.g. "East Village, NY"
    },
    photo: {
      type: String,
      default: "",
      trim: true,   // Base64 data URI or a URL string
    },
    // Array of Listing ObjectIds the user has bookmarked
    savedListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.model("User", userSchema);