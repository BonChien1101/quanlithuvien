const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

// Chỉ admin mới xem được danh sách users
router.get('/', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id','username','roles','createdAt'] });
    // Parse roles from JSON string
    const usersWithParsedRoles = users.map(u => {
      const roles = typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles;
      return { id: u.id, username: u.username, roles };
    });
    res.json(usersWithParsedRoles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user (admin only)
router.delete('/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    await user.destroy();
    res.json({ message: 'Đã xóa user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
