const express = require("express");
const router = express.Router();

const { getMyXP } = require("../controllers/xpController");
const authMiddleware = require("../middleware/authMiddleware");

// Get logged-in user's XP
router.get("/", authMiddleware, getMyXP);

module.exports = router;
