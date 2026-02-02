const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, required: true }, // 'USED' or 'DONATED'
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);