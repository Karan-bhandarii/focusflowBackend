const Activity = require("../models/Activity");

/*
|--------------------------------------------------------------------------
| GET TODAY
|--------------------------------------------------------------------------
*/

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
|--------------------------------------------------------------------------
| CREATE ACTIVITY
|--------------------------------------------------------------------------
*/

const createActivity = async ({
  userId,
  type,
  sourceId = null,
  points = 1,
}) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!type) {
    throw new Error("Activity type is required");
  }

  /*
  |--------------------------------------------------------------------------
  | Prevent duplicate activity for the same Todo/Pomodoro
  |--------------------------------------------------------------------------
  */

  if (sourceId) {
    const existingActivity = await Activity.findOne({
      user: userId,
      type,
      sourceId,
    });

    if (existingActivity) {
      return existingActivity;
    }
  }

  const activity = await Activity.create({
    user: userId,
    type,
    sourceId,
    date: getToday(),
    points,
  });

  console.log(`ACTIVITY CREATED: ${type} | ${userId} | ${activity.date}`);

  return activity;
};

/*
|--------------------------------------------------------------------------
| REMOVE ACTIVITY
|--------------------------------------------------------------------------
*/

const removeActivity = async ({ userId, type, sourceId }) => {
  if (!userId || !type || !sourceId) {
    return;
  }

  await Activity.deleteMany({
    user: userId,
    type,
    sourceId,
  });

  console.log(`ACTIVITY REMOVED: ${type} | ${userId} | ${sourceId}`);
};

module.exports = {
  createActivity,
  removeActivity,
  getToday,
};
