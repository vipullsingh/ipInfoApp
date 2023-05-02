const axios = require('axios');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const { promisify } = require('util');

// Set the Redis client to return Promises
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Retrieve IP information from an API or Redis cache
async function getIpInfo(ipAddress) {
  try {
    // Check if the IP info is already in the Redis cache
    const cachedIpInfo = await getAsync(ipAddress);
    if (cachedIpInfo) {
      return JSON.parse(cachedIpInfo);
    }

    // If the IP info is not in the cache, retrieve it from the API
    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);

    // Cache the IP info in Redis for 6 hours
    const ipInfo = response.data;
    await setAsync(ipAddress, JSON.stringify(ipInfo), 'EX', 60 * 60 * 6);

    return ipInfo;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to retrieve IP information');
  }
}

module.exports = {
  getIpInfo,
};
