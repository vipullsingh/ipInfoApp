const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const { promisify } = require('util');

// Set the Redis client to return Promises
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

// Add a JWT token to the blacklist
async function blacklistToken(token) {
  try {
    // Set the token in Redis with an expiration time of 6 hours
    await setAsync(token, 'blacklisted', 'EX', 60 * 60 * 6);
  } catch (err) {
    console.error(err);
    throw new Error('Unable to blacklist token');
  }
}

// Check if a JWT token is blacklisted
async function isTokenBlacklisted(token) {
  try {
    // Check if the token is in the blacklist
    const value = await getAsync(token);
    return value === 'blacklisted';
  } catch (err) {
    console.error(err);
    throw new Error('Unable to check if token is blacklisted');
  }
}

// Remove a JWT token from the blacklist
async function removeTokenFromBlacklist(token) {
  try {
    // Delete the token from the blacklist
    await delAsync(token);
  } catch (err) {
    console.error(err);
    throw new Error('Unable to remove token from blacklist');
  }
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  removeTokenFromBlacklist,
};
