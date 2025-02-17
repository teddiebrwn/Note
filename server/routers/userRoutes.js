import express from "express";
import passport from "../controllers/oauthController.js";

import {
  sendVerificationEmail,
  verifyOTP,
  resendOTP,
  setPassword,
  suggestUsernames,
  setUsername,
  loginUser,
  getAllUsers,
  googleAuthCallback,
  githubAuthCallback,
  // appleAuthCallback,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/send-verification", sendVerificationEmail);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP); // ✅ Route mới để gửi lại OTP
router.post("/set-password", setPassword);
router.post("/suggest-usernames", suggestUsernames);
router.post("/set-username", setUsername);
router.post("/login", loginUser);

router.get("/get", getAllUsers);

// Google OAuth Route
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuthCallback
);

// GitHub OAuth Route
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  githubAuthCallback
);

// Apple OAuth
// router.get(
//   "/auth/apple",
//   passport.authenticate("apple", { scope: ["name", "email"] })
// );

// router.get(
//   "/auth/apple/callback",
//   passport.authenticate("apple", { session: false }),
//   appleAuthCallback
// );

export default router;
