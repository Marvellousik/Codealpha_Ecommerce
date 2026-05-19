import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

// --- Rate Limiting Configuration ---
// We apply distinct limiters to login and registration. This prevents 
// attackers from exhausting server resources or brute-forcing accounts.

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    error: "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the deprecated `X-RateLimit-*` headers
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Limit each IP to 10 account creations per hour
  message: {
    success: false,
    error: "Too many accounts created from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Route Definitions ---
// We inject the rate limiter middleware directly before the controller execution.

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

export default router;