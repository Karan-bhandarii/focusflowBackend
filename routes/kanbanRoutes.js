const express = require("express");

const router = express.Router();

const {
  getKanban,
  createKanban,
  updateKanban,
  deleteKanban,
} = require("../controllers/kanbanController");

const authMiddleware = require("../middleware/authMiddleware");

// GET
router.get("/", authMiddleware, getKanban);

// CREATE
router.post("/", authMiddleware, createKanban);

// UPDATE
router.put("/:id", authMiddleware, updateKanban);

// DELETE
router.delete("/:id", authMiddleware, deleteKanban);

module.exports = router;
