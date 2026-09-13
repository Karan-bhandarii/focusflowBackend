const express = require("express");
const passport = require("../config/passport");

const {
  signup,
  login,
  githubCallback,
} = require("../controllers/authController");

const router = express.Router();

// ========================================
// NORMAL SIGNUP
// ========================================

router.post("/signup", signup);

// ========================================
// NORMAL LOGIN
// ========================================

router.post("/login", login);

// ========================================
// GITHUB LOGIN / SIGNUP
// ========================================

// Start GitHub authentication
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  }),
);

// ========================================
// GITHUB CALLBACK
// ========================================

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,

    // Production frontend
    failureRedirect:
      "https://focus-flow-pink-eight.vercel.app/login?error=github_auth_failed",
  }),

  githubCallback,
);

module.exports = router;
