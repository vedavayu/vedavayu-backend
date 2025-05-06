const express = require('express');
const router = express.Router();
const Statistics = require('../models/Statistics');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// @route   GET /api/statistics
// @desc    Get statistics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const statistics = await Statistics.getStatistics();
    res.json(statistics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/statistics
// @desc    Update statistics
// @access  Admin
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { patientsTreated, testReports, hoursSupport, recoveryRate } = req.body;
    
    let statistics = await Statistics.findOne();
    if (!statistics) {
      statistics = new Statistics({});
    }
    
    if (patientsTreated !== undefined) statistics.patientsTreated = patientsTreated;
    if (testReports !== undefined) statistics.testReports = testReports;
    if (hoursSupport !== undefined) statistics.hoursSupport = hoursSupport;
    if (recoveryRate !== undefined) statistics.recoveryRate = recoveryRate;
    
    await statistics.save();
    
    res.json({
      success: true,
      statistics
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;