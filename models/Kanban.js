const mongoose = require("mongoose");

const kanbanSchema = new mongoose.Schema(
  {
    // Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Card title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Column
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },

    // Priority
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Kanban", kanbanSchema);
