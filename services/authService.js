const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BlacklistToken = require('../models/blacklistToken');

// authenticate user
async function authenticateUser(email, password) {
  try {
    //find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // create and sign JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { user, token };
  } catch (error) {
    console.error(error);
    throw new Error('Error authenticating user');
  }
}

// logout user
async function logoutUser(token) {
  try {
    // add token to blacklist
    const blacklistToken = new BlacklistToken({ token });
    await blacklistToken.save();
  } catch (error) {
    console.error(error);
    throw new Error('Error logging out user');
  }
}

module.exports = {
  authenticateUser,
  logoutUser
};
