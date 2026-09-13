const Todo = require("../models/Todo");
const Focus = require("../models/Focus");
const Streak = require("../models/Streak");

// =====================================
// GET DASHBOARD DATA
// =====================================

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // =================================
    // TODOS
    // =================================

    const todos = await Todo.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const allTodos = await Todo.find({
      user: userId,
    });

    const totalTodos = allTodos.length;

    const completedTodos = allTodos.filter(
      (todo) => todo.completed === true,
    ).length;

    const activeTodos = totalTodos - completedTodos;

    const todoProgress =
      totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

    // =================================
    // TODAY'S DATE
    // =================================

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // =================================
    // POMODORO / FOCUS
    // =================================

    const focusSessions = await Focus.find({
      user: userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const focusSessionsToday = focusSessions.length;

    const focusMinutesToday = focusSessions.reduce(
      (total, session) => total + (session.duration || 0),
      0,
    );

    // =================================
    // STREAK
    // =================================

    const streak = await Streak.findOne({
      user: userId,
    });

    const currentStreak = streak?.currentStreak || 0;

    // =================================
    // RESPONSE
    // =================================

    res.status(200).json({
      todos: {
        total: totalTodos,
        completed: completedTodos,
        active: activeTodos,
        progress: todoProgress,
        recent: todos,
      },

      focus: {
        sessions: focusSessionsToday,
        minutes: focusMinutesToday,
      },

      streak: {
        current: currentStreak,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};
