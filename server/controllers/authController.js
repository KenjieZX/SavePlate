const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, householdSize, enable2FA } = req.body;

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash Password (Security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    user = new User({
      fullName,
      email,
      password: hashedPassword,
      householdSize,
      privacySettings: { enable2FA }
    });

    await user.save();

    // 4. Create Token (Auto-login after register)
    const payload = { user: { id: user.id } };
    
    // NOTE: In a real app, use a strong secret in .env
    jwt.sign(payload, 'secret_token_123', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.fullName } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check User
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    // 2. Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    // 3. Return Token
    const payload = { user: { id: user.id } };
    
    jwt.sign(payload, 'secret_token_123', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.fullName } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};