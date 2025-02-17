import express from "express";
import passport from "../controllers/oauthController.js";
import {
  googleAuthCallback,
  githubAuthCallback,
} from "../controllers/oauthController.js";

const router = express.Router();

// ✅ Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Xử lý callback, CHUYỂN HƯỚNG về frontend
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuthCallback
);

// ✅ GitHub OAuth
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// ✅ Xử lý callback, CHUYỂN HƯỚNG về frontend
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  githubAuthCallback
);

export default router;
