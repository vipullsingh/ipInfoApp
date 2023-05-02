const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Get user's search history
router.get('/search-history', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's search history from database
    const user = await User.findById(userId).populate('searchHistory.ipInfo');

    return res.json(user.searchHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving search history' });
  }
});

module.exports = router;
