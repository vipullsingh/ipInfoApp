const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const IpInfo = require('../models/ipInfo');

// Get IP info for a specific IP address
router.get('/:ipAddress', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const ipAddress = req.params.ipAddress;

    // Check if IP info is already in cache
    const cachedIpInfo = await IpInfo.findOne({ ipAddress });
    if (cachedIpInfo && (Date.now() - cachedIpInfo.createdAt.getTime() < 6 * 60 * 60 * 1000)) {
      return res.json({ city: cachedIpInfo.city });
    }

    // Get IP info from API
    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
    const { city } = response.data;

    // Cache IP info in database
    const ipInfo = new IpInfo({ ipAddress, city });
    await ipInfo.save();

    return res.json({ city });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving IP info' });
  }
});

module.exports = router;
