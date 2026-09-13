const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["todo", "pomodoro"],
      required: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    date: {
      type: String,
      required: true,
    },

    points: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({
  user: 1,
  date: 1,
});

activitySchema.index({
  user: 1,
  type: 1,
  sourceId: 1,
});

module.exports = mongoose.model("Activity", activitySchema);
