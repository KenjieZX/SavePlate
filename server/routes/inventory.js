const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog'); // Import Log
const auth = require('../middleware/authMiddleware');

// GET Items (Browse/Inventory)
router.get('/', auth, async (req, res) => {
  try {
    const type = req.query.type || 'Inventory';
    const isDonation = type === 'Donation';
    const items = await Item.find({ user: req.user.id, isDonation: isDonation }).sort({ expiryDate: 1 });
    res.json(items);
  } catch (err) { res.status(500).send('Server Error'); }
});

// GET Browse (Public)
router.get('/browse', auth, async (req, res) => {
  try {
    const myItems = await Item.find({ user: req.user.id, isDonation: false });
    const allDonations = await Item.find({ isDonation: true }).populate('user', 'fullName');
    
    const myInventoryList = myItems.map(item => ({ ...item._doc, displayType: 'Inventory', ownerName: 'Me' }));
    const donationList = allDonations.map(item => ({
      ...item._doc,
      displayType: 'Donation',
      ownerName: (item.user && item.user._id.toString() === req.user.id) ? 'Me' : (item.user ? item.user.fullName : 'Anonymous')
    }));
    
    res.json([...myInventoryList, ...donationList]);
  } catch (err) { res.status(500).send('Server Error'); }
});

// ADD Item
router.post('/add', auth, async (req, res) => {
  try {
    const newItem = new Item({ user: req.user.id, ...req.body, isDonation: false });
    const item = await newItem.save();
    res.json(item);
  } catch (err) { res.status(500).send('Server Error'); }
});

// EDIT Item
router.put('/:id', auth, async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item || item.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    item = await Item.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(item);
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- KEY UPDATE: DELETE (MARK AS USED) ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // 1. CREATE LOG BEFORE DELETING
    const newLog = new ActivityLog({
      user: req.user.id,
      actionType: 'USED',
      itemName: item.name,
      quantity: item.quantity,
      category: item.category
    });
    await newLog.save();

    // 2. DELETE
    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item removed and logged as used' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- KEY UPDATE: DONATE ---
router.put('/:id/donate', auth, async (req, res) => {
  try {
    const { pickupLocation, availability } = req.body;
    let item = await Item.findById(req.params.id);
    if (!item || item.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    item.isDonation = true;
    item.pickupLocation = pickupLocation;
    item.availability = availability;
    await item.save();

    // 1. LOG THE DONATION
    const newLog = new ActivityLog({
      user: req.user.id,
      actionType: 'DONATED',
      itemName: item.name,
      quantity: item.quantity,
      category: item.category
    });
    await newLog.save();

    res.json(item);
  } catch (err) { res.status(500).send('Server Error'); }
});


// ==========================================
// NEW ROUTE: CLAIM DONATION
// ==========================================
// @route   PUT api/inventory/:id/claim
// @desc    Transfer ownership of a donation to the current user
router.put('/:id/claim', auth, async (req, res) => {
  try {
    // 1. Find the donation
    const item = await Item.findById(req.params.id);
    
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    if (!item.isDonation) return res.status(400).json({ msg: 'Item is not available for claim' });
    if (item.user.toString() === req.user.id) return res.status(400).json({ msg: 'You cannot claim your own item' });

    const originalOwnerId = item.user;
    const itemName = item.name;

    // 2. Transfer Ownership (The Magic Step)
    item.user = req.user.id;       // Set new owner (Me)
    item.isDonation = false;       // It's not a donation anymore, it's my inventory
    item.pickupLocation = '';      // Clear donation details
    item.availability = '';
    await item.save();

    // 3. Notify the Original Owner
    // We need to require the Notification model inside the route or ensuring it's loaded
    const Notification = require('../models/Notification'); 
    
    await new Notification({
      user: originalOwnerId, // Send alert to the person who gave it away
      type: 'DONATION',
      message: `Good news! Your donation "${itemName}" has been claimed and saved from waste.`,
      relatedId: item._id
    }).save();

    res.json(item);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;