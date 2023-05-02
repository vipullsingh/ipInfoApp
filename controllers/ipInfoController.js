const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');
const logger = require('../utils/logger');

const redisClient = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

// Get IP info for a given IP address
async function getIpInfo(req, res, next) {
  try {
    // Check if IP info is in cache
    const { ipAddress } = req.params;
    const ipInfo = await getAsync(ipAddress);
    if (ipInfo) {
      logger.info(`Retrieved IP info for ${ipAddress} from cache`);
      return res.json(JSON.parse(ipInfo));
    }

    // Make API request to get IP info
    const { data } = await axios.get(`https://ipapi.co/${ipAddress}/json/`);

    // Cache IP info for 6 hours
    await setAsync(ipAddress, JSON.stringify(data));
    await expireAsync(ipAddress, 60 * 60 * 6);

    logger.info(`Retrieved IP info for ${ipAddress} from API`);
    res.json(data);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

module.exports = {
  getIpInfo,
};
