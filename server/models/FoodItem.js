const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['Canned', 'Frozen', 'Fresh', 'Dry', 'Other'], 
    required: true 
  },
  storageLocation: { type: String }, 
  status: { 
    type: String, 
    enum: ['Inventory', 'Donation', 'Used', 'Trash'], 
    default: 'Inventory' 
  }, 
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);