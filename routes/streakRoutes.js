const express = require("express");

const router = express.Router();

const { getStreak } = require("../controllers/streakController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getStreak);

module.exports = router;
