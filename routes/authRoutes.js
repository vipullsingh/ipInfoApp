const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BlacklistToken = require('../models/blacklistToken');

// Login route
router.post('/login', async (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.login(user, { session: false }, async (error) => {
      if (error) {
        return next(error);
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return res.json({ token });
    });
  })(req, res, next);
});

// Logout route
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const blacklistToken = new BlacklistToken({ token });
  await blacklistToken.save();
  res.sendStatus(200);
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
