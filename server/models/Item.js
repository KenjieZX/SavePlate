const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  category: { type: String, default: 'Fresh' },
  storageLocation: { type: String },
  
  // Donation Specific Fields
  isDonation: { type: Boolean, default: false },
  pickupLocation: { type: String, default: '' },
  availability: { type: String, default: '' }, // e.g., "Weekdays 9-5"
  
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', ItemSchema);