const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| XP LEVEL SYSTEM
|--------------------------------------------------------------------------
*/

const LEVELS = [
  {
    level: 1,
    requiredXP: 0,
    title: "Focus Beginner",
  },
  {
    level: 2,
    requiredXP: 100,
    title: "Focus Starter",
  },
  {
    level: 3,
    requiredXP: 250,
    title: "Focus Seeker",
  },
  {
    level: 4,
    requiredXP: 450,
    title: "Focus Builder",
  },
  {
    level: 5,
    requiredXP: 700,
    title: "Focus Master",
  },
  {
    level: 6,
    requiredXP: 1000,
    title: "Disciplined",
  },
  {
    level: 7,
    requiredXP: 1400,
    title: "Focus Warrior",
  },
  {
    level: 8,
    requiredXP: 1900,
    title: "Deep Worker",
  },
  {
    level: 9,
    requiredXP: 2500,
    title: "Flow Master",
  },
  {
    level: 10,
    requiredXP: 3250,
    title: "Focus Legend",
  },
];

/*
|--------------------------------------------------------------------------
| Calculate level from XP
|--------------------------------------------------------------------------
*/

const calculateLevel = (xp) => {
  let currentLevel = LEVELS[0];

  for (const levelData of LEVELS) {
    if (xp >= levelData.requiredXP) {
      currentLevel = levelData;
    } else {
      break;
    }
  }

  return currentLevel;
};

/*
|--------------------------------------------------------------------------
| Get next level
|--------------------------------------------------------------------------
*/

const getNextLevel = (currentLevel) => {
  return (
    LEVELS.find((levelData) => levelData.level === currentLevel + 1) || null
  );
};

/*
|--------------------------------------------------------------------------
| Add XP to user
|--------------------------------------------------------------------------
*/

const addXP = async (userId, amount) => {
  if (!userId || !amount || amount <= 0) {
    return null;
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found while adding XP");
  }

  const newXP = (user.xp || 0) + amount;
  const currentLevel = calculateLevel(newXP);

  user.xp = newXP;
  user.level = currentLevel.level;

  await user.save();

  return {
    xp: user.xp,
    level: user.level,
    title: currentLevel.title,
  };
};

/*
|--------------------------------------------------------------------------
| Get XP details
|--------------------------------------------------------------------------
*/

const getXPDetails = (xp = 0) => {
  const currentLevel = calculateLevel(xp);
  const nextLevel = getNextLevel(currentLevel.level);

  const currentLevelXP = currentLevel.requiredXP;
  const nextLevelXP = nextLevel
    ? nextLevel.requiredXP
    : currentLevel.requiredXP + 1750;

  const levelRange = nextLevelXP - currentLevelXP;
  const earnedInLevel = xp - currentLevelXP;

  const progress = nextLevel
    ? Math.min(100, Math.max(0, Math.round((earnedInLevel / levelRange) * 100)))
    : 100;

  const remainingXP = nextLevel ? Math.max(0, nextLevelXP - xp) : 0;

  return {
    xp,
    level: currentLevel.level,
    title: currentLevel.title,
    currentLevelXP,
    nextLevelXP,
    progress,
    remainingXP,
  };
};

module.exports = {
  LEVELS,
  calculateLevel,
  getNextLevel,
  addXP,
  getXPDetails,
};
