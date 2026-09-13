const Focus = require("../models/Focus");
const mongoose = require("mongoose");

const { createActivity, removeActivity } = require("../utils/activity");

const getWeekStart = (value) => {
  const date = new Date(value);
  const day = date.getUTCDay() || 7;

  date.setUTCDate(date.getUTCDate() - day + 1);
  date.setUTCHours(0, 0, 0, 0);

  return date;
};

const toDateKey = (date) => date.toISOString().slice(0, 10);

/*
|--------------------------------------------------------------------------
| SAVE COMPLETED FOCUS SESSION
|--------------------------------------------------------------------------
*/

const createFocus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { duration, completedAt } = req.body;

    if (!duration) {
      return res.status(400).json({
        message: "Duration is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE FOCUS SESSION
    |--------------------------------------------------------------------------
    */

    const focus = await Focus.create({
      user: userId,
      duration: Number(duration),
      completedAt: completedAt || new Date(),
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE STREAK ACTIVITY
    |--------------------------------------------------------------------------
    */

    await createActivity({
      userId,
      type: "pomodoro",
      sourceId: focus._id,
      points: 1,
    });

    res.status(201).json({
      message: "Focus session completed",
      focus,
    });
  } catch (error) {
    console.error("CREATE FOCUS ERROR:", error);

    res.status(500).json({
      message: "Unable to save focus session",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET FOCUS STATS
|--------------------------------------------------------------------------
*/

const getFocusStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Focus.find({
      user: userId,
    }).sort({
      completedAt: -1,
    });

    const totalSessions = sessions.length;

    const totalMinutes = sessions.reduce(
      (total, session) => total + Number(session.duration || 0),
      0,
    );

    res.status(200).json({
      sessions: totalSessions,
      totalMinutes,
    });
  } catch (error) {
    console.error("GET FOCUS STATS ERROR:", error);

    res.status(500).json({
      message: "Unable to get focus stats",
    });
  }
};

const getWeeklyFocusStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Focus.find({ user: userId }).select(
      "duration completedAt",
    );
    const weeks = new Map();

    const addWeek = (date) => {
      const weekStart = getWeekStart(date);
      const key = toDateKey(weekStart);

      if (!weeks.has(key)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

        weeks.set(key, {
          weekStart: key,
          weekEnd: toDateKey(weekEnd),
          sessions: 0,
          totalMinutes: 0,
        });
      }

      return weeks.get(key);
    };

    addWeek(new Date());

    sessions.forEach((session) => {
      const week = addWeek(session.completedAt);
      week.sessions += 1;
      week.totalMinutes += Number(session.duration || 0);
    });

    const summary = [...weeks.values()]
      .map((week) => ({
        ...week,
        totalMinutes: Math.round(week.totalMinutes),
      }))
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart));

    return res.status(200).json({ weeks: summary });
  } catch (error) {
    console.error("GET WEEKLY FOCUS STATS ERROR:", error);

    return res.status(500).json({
      message: "Unable to get weekly focus stats",
    });
  }
};

const getFocusSessions = async (req, res) => {
  try {
    const sessions = await Focus.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .limit(50)
      .select("duration completedAt");

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error("GET FOCUS SESSIONS ERROR:", error);

    return res.status(500).json({ message: "Unable to get focus sessions" });
  }
};

const deleteFocusSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid focus session ID" });
    }

    const session = await Focus.findOneAndDelete({ _id: id, user: req.user.id });

    if (!session) {
      return res.status(404).json({ message: "Focus session not found" });
    }

    await removeActivity({
      userId: req.user.id,
      type: "pomodoro",
      sourceId: session._id,
    });

    return res.status(200).json({ message: "Focus session deleted" });
  } catch (error) {
    console.error("DELETE FOCUS SESSION ERROR:", error);

    return res.status(500).json({ message: "Unable to delete focus session" });
  }
};

module.exports = {
  createFocus,
  getFocusStats,
  getWeeklyFocusStats,
  getFocusSessions,
  deleteFocusSession,
};
