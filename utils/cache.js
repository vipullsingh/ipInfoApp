const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// cache key prefix
const CACHE_PREFIX = 'ipinfo_';

// Cache IP info for a specific IP address with a 6 hour expiration time
function cacheIPInfo(ip, info) {
  client.setex(CACHE_PREFIX + ip, 21600, JSON.stringify(info));
}

// retrieve cached IP info for a specific IP address
async function getCachedIPInfo(ip) {
  return new Promise((resolve, reject) => {
    client.get(CACHE_PREFIX + ip, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result ? JSON.parse(result) : null);
      }
    });
  });
}

module.exports = {
  cacheIPInfo,
  getCachedIPInfo
};
