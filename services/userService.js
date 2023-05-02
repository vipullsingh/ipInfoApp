const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BlacklistToken = require('../models/blacklistToken');

// register a new user in the database
async function registerUser(name, email, password) {
  try {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new User object with hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return { message: 'User registered successfully' };
  } catch (error) {
    console.error(error);
    throw new Error('Error registering user');
  }
}

// authenticate user with email and password
async function authenticateUser(email, password) {
  try {
    // find user with matching email in database
    const user = await User.findOne({ email });

    // if user doesn't exist or password doesn't match, return null
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    // generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    return { token };
  } catch (error) {
    console.error(error);
    throw new Error('Error authenticating user');
  }
}

// logout user by blacklisting token in Redis
async function logoutUser(token) {
  try {
    // add token to blacklist in Redis
    const blacklistToken = new BlacklistToken({ token });
    await blacklistToken.save();

    return { message: 'User logged out successfully' };
  } catch (error) {
    console.error(error);
    throw new Error('Error logging out user');
  }
}

module.exports = {
  registerUser,
  authenticateUser,
  logoutUser
};
