// ─── JWT Authentication Middleware ───────────────────────────────────────────
// Verifies the Bearer token on every protected route.
// On success, attaches req.userId so controllers know who is making the request.
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Reject requests that have no Authorization header or wrong scheme
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token signature and expiry; throws if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Inject userId for downstream controllers
    next();
  } catch {
    // Token is expired, tampered, or malformed
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
