const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

// Đăng ký công khai: luôn gán vai trò USER
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Missing' });
  // Kiểm tra user đã tồn tại hay chưa
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'User exists' });
  const roles = [ROLES.USER];
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
  console.log('Yêu cầu đăng nhập:', username);
    
    if (!username || !password) {
  console.log('Thiếu thông tin đăng nhập');
      return res.status(400).json({ message: 'Missing credentials' });
    }
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
  console.log('Không tìm thấy người dùng:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
  console.log('Đã tìm thấy người dùng, đang kiểm tra mật khẩu...');
  const ok = await user.validatePassword(password);
    
    if (!ok) {
  console.log('Mật khẩu không đúng cho người dùng:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
  // Chuyển chuỗi JSON roles về mảng nếu cần
    let roles = user.roles || ['USER'];
    if (typeof roles === 'string') {
      roles = JSON.parse(roles);
    }
  console.log('Tạo token cho người dùng với vai trò:', roles);
    const token = jwt.sign({ id: user.id, username: user.username, roles }, JWT_SECRET, { expiresIn: '7d' });
  console.log('Đăng nhập thành công:', username);
    res.json({ token, roles });
  } catch (err) {
  console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin tạo người dùng với vai trò LIBRARIAN hoặc USER
router.post('/admin/create-user', authenticate, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { username, password, role } = req.body || {};
    if (!username || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    if (![ROLES.LIBRARIAN, ROLES.USER].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Only LIBRARIAN or USER allowed.' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'User exists' });
    const roles = [role];
    const user = await User.create({ username, password, roles });
    res.status(201).json({ id: user.id, username: user.username, roles });
  } catch (err) {
  console.error('Lỗi admin tạo tài khoản:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
