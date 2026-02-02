const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true }, // e.g. "Monday"
  type: { type: String, required: true }, // e.g. "Breakfast"
  mealName: { type: String, required: true },
  ingredients: [{ type: String }] // List of item names used (e.g. "Eggs", "Milk")
});

module.exports = mongoose.model('Meal', MealSchema);