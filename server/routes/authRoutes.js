// ─── Auth Routes ─────────────────────────────────────────────────────────────
// Public endpoints — no JWT required.
import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup); // Register a new user account
router.post("/login",  login);  // Authenticate and receive a JWT

export default router;
