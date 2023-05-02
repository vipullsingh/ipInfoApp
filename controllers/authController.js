const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../utils/logger');

// handle user login
async function login(req, res, next) {
  try {
    // get user from database
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // return token
    res.json({ token });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

// handle user registration
async function register(req, res, next) {
  try {
    // create user in database
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // return token
    res.status(201).json({ token });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

module.exports = {
  login,
  register,
};
