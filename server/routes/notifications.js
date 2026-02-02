const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Item = require('../models/Item');
const Meal = require('../models/Meal');
const auth = require('../middleware/authMiddleware');

// @route   GET api/notifications
// @desc    Generate alerts & Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    
    // --- 1. AUTO-GENERATE INVENTORY ALERTS (Expiring in 3 days) ---
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const expiringItems = await Item.find({
      user: userId,
      expiryDate: { $lte: threeDaysFromNow, $gte: today },
      isDonation: false 
    });

    for (const item of expiringItems) {
      // Check if alert already exists to avoid duplicates
      const exists = await Notification.findOne({ user: userId, relatedId: item._id, type: 'INVENTORY' });
      if (!exists) {
        await new Notification({
          user: userId,
          type: 'INVENTORY',
          message: `Your "${item.name}" is expiring soon (${new Date(item.expiryDate).toLocaleDateString()})!`,
          relatedId: item._id
        }).save();
      }
    }

    // --- 2. AUTO-GENERATE MEAL REMINDERS (For Today) ---
    // Get day name (e.g., "Monday")
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[today.getDay()];

    const todaysMeals = await Meal.find({ user: userId, day: currentDayName });

    for (const meal of todaysMeals) {
      const exists = await Notification.findOne({ user: userId, relatedId: meal._id, type: 'MEAL' });
      if (!exists) {
        await new Notification({
          user: userId,
          type: 'MEAL',
          message: `Reminder: You planned "${meal.mealName}" for ${meal.type} today.`,
          relatedId: meal._id
        }).save();
      }
    }

    // --- 3. RETURN ALL NOTIFICATIONS (Sorted by Newest) ---
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ msg: 'Notification not found' });
    if (notif.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    notif.isRead = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;