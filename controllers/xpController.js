const User = require("../models/User");
const { getXPDetails } = require("../utils/xp");

const getMyXP = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("xp level");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const xpData = getXPDetails(user.xp || 0);

    return res.status(200).json(xpData);
  } catch (error) {
    console.error("GET XP ERROR:", error);

    return res.status(500).json({
      message: "Unable to load XP",
    });
  }
};

module.exports = {
  getMyXP,
};
