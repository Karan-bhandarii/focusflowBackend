const Activity = require("../models/Activity");

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateToNumber = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
};

const getPreviousDate = (dateString) => {
  const timestamp = dateToNumber(dateString);

  return new Date(timestamp - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
};

const getNextDate = (dateString) => {
  const timestamp = dateToNumber(dateString);

  return new Date(timestamp + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
};

/*
|--------------------------------------------------------------------------
| GET STREAK
|--------------------------------------------------------------------------
*/

const getStreak = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const userId = req.user?.id;

    console.log("STREAK USER:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET ACTIVITIES
    |--------------------------------------------------------------------------
    */

    const activities = await Activity.find({
      user: userId,
    }).sort({
      date: 1,
    });

    /*
    |--------------------------------------------------------------------------
    | GROUP BY DATE
    |--------------------------------------------------------------------------
    */

    const dayMap = {};

    activities.forEach((activity) => {
      if (!dayMap[activity.date]) {
        dayMap[activity.date] = {
          date: activity.date,
          todos: 0,
          pomodoros: 0,
          total: 0,
          active: true,
        };
      }

      if (activity.type === "todo") {
        dayMap[activity.date].todos += 1;
      }

      if (activity.type === "pomodoro") {
        dayMap[activity.date].pomodoros += 1;
      }

      dayMap[activity.date].total += 1;
    });

    /*
    |--------------------------------------------------------------------------
    | ACTIVE DATES
    |--------------------------------------------------------------------------
    */

    const activeDates = Object.keys(dayMap).sort();

    /*
    |--------------------------------------------------------------------------
    | TODAY
    |--------------------------------------------------------------------------
    */

    const today = getToday();

    const todayActivity = dayMap[today] || {
      date: today,
      todos: 0,
      pomodoros: 0,
      total: 0,
      active: false,
    };

    /*
    |--------------------------------------------------------------------------
    | CURRENT STREAK
    |--------------------------------------------------------------------------
    |
    | Current streak only counts if TODAY is active.
    |
    */

    let currentStreak = 0;

    if (dayMap[today]) {
      currentStreak = 1;

      let currentDate = today;

      while (true) {
        const previousDate = getPreviousDate(currentDate);

        if (!dayMap[previousDate]) {
          break;
        }

        currentStreak++;

        currentDate = previousDate;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | BEST STREAK
    |--------------------------------------------------------------------------
    */

    let bestStreak = 0;
    let runningStreak = 0;
    let previousDate = null;

    for (const date of activeDates) {
      if (!previousDate) {
        runningStreak = 1;
      } else {
        const expectedNextDate = getNextDate(previousDate);

        if (date === expectedNextDate) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      }

      bestStreak = Math.max(bestStreak, runningStreak);

      previousDate = date;
    }

    /*
    |--------------------------------------------------------------------------
    | HISTORY
    |--------------------------------------------------------------------------
    */

    const history = activeDates.map((date) => dayMap[date]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      currentStreak,
      bestStreak,

      todayActive: todayActivity.active,

      today: todayActivity,

      totalActivities: activities.length,

      history,
    });
  } catch (error) {
    console.error("GET STREAK ERROR:", error);

    return res.status(500).json({
      message: "Unable to get streak",
      error: error.message,
    });
  }
};

module.exports = {
  getStreak,
};
