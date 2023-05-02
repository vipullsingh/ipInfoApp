const User = require('../models/user');
const logger = require('../utils/logger');

// get the current user's profile
async function getCurrentUserProfile(req, res, next) {
  try {
    // get the user from the token
    const userId = req.user.userId;
    const user = await User.findById(userId);

    // return the user's profile
    res.json({ user });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

// update the current user's profile
async function updateCurrentUserProfile(req, res, next) {
  try {
    // get the user from the token
    const userId = req.user.userId;

    // update the user's profile
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    // return the updated user's profile
    res.json({ user });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
