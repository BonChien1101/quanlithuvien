const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Missing' });
    // if user exists
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'User exists' });
    const roles = (username === 'admin') ? ['ADMIN'] : ['USER'];
    const user = await User.create({ username, password, roles });
    const token = jwt.sign({ id: user.id, username: user.username, roles }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    console.log('Login attempt:', username);
    
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Missing credentials' });
    }
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', username, 'checking password...');
    const ok = await user.validatePassword(password);
    console.log('Password valid:', ok);
    
    if (!ok) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Parse roles from JSON string if needed
    let roles = user.roles || ['USER'];
    if (typeof roles === 'string') {
      roles = JSON.parse(roles);
    }
    console.log('Creating token for user:', username, 'roles:', roles);
    const token = jwt.sign({ id: user.id, username: user.username, roles }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Login successful:', username);
    res.json({ token, roles });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
