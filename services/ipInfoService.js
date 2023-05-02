const axios = require('axios');
const IpInfo = require('../models/ipInfo');

// Get IP info from cache or API
async function getIpInfo(ip) {
  try {
    // check if IP info is cached in Redis
    const cachedIpInfo = await IpInfo.findOne({ ip });
    if (cachedIpInfo && !cachedIpInfo.isExpired()) {
      console.log(`Retrieved IP info for ${ip} from cache`);
      return cachedIpInfo;
    }

    // call IP info API to get current city for IP
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const city = response.data.city;

    // create new IpInfo object with city and expiration time
    const newIpInfo = new IpInfo({ ip, city });
    await newIpInfo.save();
    console.log(`Retrieved IP info for ${ip} from API`);

    return newIpInfo;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting IP info');
  }
}

module.exports = {
  getIpInfo
};
