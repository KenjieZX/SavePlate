const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  householdSize: { type: Number, default: 1 }, 
  privacySettings: {
    enable2FA: { type: Boolean, default: false }, 
    visibility: { type: String, enum: ['public', 'private'], default: 'private' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);