const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/authMiddleware');

// @route   GET api/analytics
// @desc    Get stats for the dashboard
router.get('/', auth, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id });

    // 1. Calculate Totals
    const totalSaved = logs.filter(l => l.actionType === 'USED').length;
    const totalDonated = logs.filter(l => l.actionType === 'DONATED').length;

    // 2. Prepare Data for "Category Pie Chart"
    const categoryStats = {};
    logs.forEach(log => {
      categoryStats[log.category] = (categoryStats[log.category] || 0) + 1;
    });
    
    // Convert to array for Recharts
    const pieData = Object.keys(categoryStats).map(key => ({
      name: key,
      value: categoryStats[key]
    }));

    // 3. Prepare Data for "Monthly Progress Bar Chart"
    // (Simplified for assignment: Grouping by Date)
    const recentActivity = logs.slice(-5).map(l => ({
      date: new Date(l.date).toLocaleDateString(),
      name: l.itemName,
      action: l.actionType
    }));

    res.json({
      totalSaved,
      totalDonated,
      pieData,
      recentActivity,
      hasHistory: logs.length > 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;