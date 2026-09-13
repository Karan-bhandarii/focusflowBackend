const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ========================================
// CREATE JWT
// ========================================

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// ========================================
// SIGNUP
// ========================================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ========================================
    // CHECK REQUIRED FIELDS
    // ========================================

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ========================================
    // VALIDATE EMAIL
    // ========================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // ========================================
    // VALIDATE PASSWORD
    // ========================================

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ========================================
    // CLEAN DATA
    // ========================================

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ========================================
    // CREATE USER
    // ========================================

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    // ========================================
    // CREATE JWT
    // ========================================

    const token = createToken(user);

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      message: "Signup successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ========================================
    // CHECK FIELDS
    // ========================================

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ========================================
    // CHECK PASSWORD
    // ========================================

    if (!user.password) {
      return res.status(401).json({
        message: "This account uses GitHub login. Please continue with GitHub.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ========================================
    // CREATE JWT
    // ========================================

    const token = createToken(user);

    // ========================================
    // RESPONSE
    // ========================================

    return res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ========================================
// GITHUB CALLBACK
// ========================================

const githubCallback = async (req, res) => {
  try {
    console.log("=================================");
    console.log("GITHUB CALLBACK");
    console.log("=================================");

    if (!req.user) {
      return res.redirect(
        "http://localhost:3000/login?error=github_auth_failed",
      );
    }

    // ========================================
    // CREATE FOCUSFLOW JWT
    // ========================================

    const token = createToken(req.user);

    // ========================================
    // USER DATA
    // ========================================

    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };

    // ========================================
    // ENCODE USER
    // ========================================

    const encodedUser = encodeURIComponent(JSON.stringify(user));

    // ========================================
    // REDIRECT FRONTEND
    // ========================================

    return res.redirect(
      `http://localhost:3000/auth/github-success?token=${token}&user=${encodedUser}`,
    );
  } catch (error) {
    console.error("GITHUB CALLBACK ERROR:", error);

    return res.redirect("http://localhost:3000/login?error=github_auth_failed");
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  signup,
  login,
  githubCallback,
};
