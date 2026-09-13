const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const focusRoutes = require("./routes/focusRoutes");
const streakRoutes = require("./routes/streakRoutes");
const dashboardRoutes = require("./routes/dashboarRoutes");
const kanbanRoutes = require("./routes/kanbanRoutes");
const xpRoutes = require("./routes/xpRoutes");
const passport = require("./config/passport");

const connectDB = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Database
connectDB();

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FocusFlow Backend is Working 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/kanban", kanbanRoutes);
app.use("/api/xp", xpRoutes);

app.listen(PORT, () => {
  console.log(`FocusFlow Backend running on http://localhost:${PORT}`);
});
