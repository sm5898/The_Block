// ─── Auth Controller ─────────────────────────────────────────────────────────
// Handles user registration (signup) and authentication (login).
// Passwords are hashed with bcrypt; sessions are represented as signed JWTs.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
// Creates a new user account. Returns a JWT so the client is immediately logged in.
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate all required fields are present
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent duplicate accounts for the same email address
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password with bcrypt (cost factor 10) before persisting
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Issue a JWT valid for 7 days so the user stays logged in across sessions
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Validates credentials and returns a fresh JWT on success.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Both fields are required for authentication
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Look up the user — use the same generic message for missing user and wrong
    // password to avoid leaking whether an email is registered
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the submitted plaintext password against the stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Re-issue a JWT on each successful login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};