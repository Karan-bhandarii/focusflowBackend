const Kanban = require("../models/Kanban");

const statusFromRequest = (status, column) => {
  if (status) return status;

  return {
    todo: "TODO",
    progress: "IN_PROGRESS",
    done: "DONE",
  }[column] || "TODO";
};

// =====================================
// GET ALL KANBAN CARDS
// =====================================

const getKanban = async (req, res) => {
  try {
    const cards = await Kanban.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(cards);
  } catch (error) {
    console.error("GET KANBAN ERROR:", error);

    res.status(500).json({
      message: "Failed to get Kanban cards",
    });
  }
};

// =====================================
// CREATE KANBAN CARD
// =====================================

const createKanban = async (req, res) => {
  try {
    const { title, description, status, column, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const card = await Kanban.create({
      user: req.user.id,
      title: title.trim(),
      description: description || "",
      status: statusFromRequest(status, column),
      priority: priority || "Medium",
    });

    res.status(201).json(card);
  } catch (error) {
    console.error("CREATE KANBAN ERROR:", error);

    res.status(500).json({
      message: "Failed to create Kanban card",
    });
  }
};

// =====================================
// UPDATE KANBAN CARD
// =====================================

const updateKanban = async (req, res) => {
  try {
    const card = await Kanban.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!card) {
      return res.status(404).json({
        message: "Kanban card not found",
      });
    }

    const { title, description, status, column, priority } = req.body;

    if (title !== undefined) {
      card.title = title.trim();
    }

    if (description !== undefined) {
      card.description = description;
    }

    if (status !== undefined || column !== undefined) {
      card.status = statusFromRequest(status, column);
    }

    if (priority !== undefined) {
      card.priority = priority;
    }

    await card.save();

    res.status(200).json(card);
  } catch (error) {
    console.error("UPDATE KANBAN ERROR:", error);

    res.status(500).json({
      message: "Failed to update Kanban card",
    });
  }
};

// =====================================
// DELETE KANBAN CARD
// =====================================

const deleteKanban = async (req, res) => {
  try {
    const card = await Kanban.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!card) {
      return res.status(404).json({
        message: "Kanban card not found",
      });
    }

    res.status(200).json({
      message: "Kanban card deleted",
    });
  } catch (error) {
    console.error("DELETE KANBAN ERROR:", error);

    res.status(500).json({
      message: "Failed to delete Kanban card",
    });
  }
};

module.exports = {
  getKanban,
  createKanban,
  updateKanban,
  deleteKanban,
};
