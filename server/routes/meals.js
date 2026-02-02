const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/authMiddleware');

// @route   GET api/meals
// @desc    Get all meals for the user
router.get('/', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user.id });
    res.json(meals);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/meals
// @desc    Add or Update a meal slot
router.post('/', auth, async (req, res) => {
  try {
    const { day, type, mealName, ingredients } = req.body;

    // Remove any existing meal for this specific slot to avoid duplicates
    await Meal.findOneAndDelete({ user: req.user.id, day, type });

    const newMeal = new Meal({
      user: req.user.id,
      day,
      type,
      mealName,
      ingredients
    });

    const savedMeal = await newMeal.save();
    res.json(savedMeal);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/meals/:id
// @desc    Remove a meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ msg: 'Meal not found' });
    
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Meal.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Meal removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/meals/:id/cook
// @desc    Deduct quantities of ingredients used in this meal
router.post('/:id/cook', auth, async (req, res) => {
  try {
    // 1. Get the Meal
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ msg: 'Meal not found' });
    if (meal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const results = [];

    // 2. Loop through ingredients and update inventory
    for (const ingredientName of meal.ingredients) {
      // FIX IS HERE: Correct RegExp syntax
      const item = await Item.findOne({ 
        user: req.user.id, 
        name: { $regex: new RegExp('^' + ingredientName + '$', 'i') } 
      });

      if (item) {
        // Decrement Quantity
        item.quantity = item.quantity - 1;

        // Log the activity for Analytics
        await new ActivityLog({
          user: req.user.id,
          actionType: 'USED',
          itemName: item.name,
          quantity: 1,
          category: item.category
        }).save();

        if (item.quantity <= 0) {
          // If 0, delete it
          await Item.findByIdAndDelete(item._id);
          results.push(`Used up ${item.name}`);
        } else {
          // Otherwise, save new quantity
          await item.save();
          results.push(`Decreased ${item.name} to ${item.quantity}`);
        }
      } else {
        results.push(`${ingredientName} not found in inventory (skipped)`);
      }
    }

    res.json({ msg: 'Meal cooked', updates: results });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;