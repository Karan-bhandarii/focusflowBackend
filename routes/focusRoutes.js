const express = require("express");

const router = express.Router();

const {
  createFocus,
  getFocusStats,
  getWeeklyFocusStats,
  getFocusSessions,
  deleteFocusSession,
} = require("../controllers/focusController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createFocus);

router.get("/stats", authMiddleware, getFocusStats);
router.get("/weekly", authMiddleware, getWeeklyFocusStats);
router.get("/sessions", authMiddleware, getFocusSessions);
router.delete("/:id", authMiddleware, deleteFocusSession);

module.exports = router;
