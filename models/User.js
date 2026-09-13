const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // NAME
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================
    // EMAIL
    // ========================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ========================================
    // PASSWORD
    // ========================================

    // Not required because GitHub users
    // don't necessarily have a password.
    password: {
      type: String,
      required: false,
    },

    // ========================================
    // GITHUB ID
    // ========================================

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
