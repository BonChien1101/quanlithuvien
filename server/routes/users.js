const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// Admin tạo tài khoản Librarian/User
router.post('/', authenticate, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { username, password, role } = req.body || {};
    if (!username || !password || !role) return res.status(400).json({ message: 'Thiếu thông tin' });
    if (![ROLES.LIBRARIAN, ROLES.USER].includes(role)) {
      return res.status(400).json({ message: 'Chỉ được tạo LIBRARIAN hoặc USER' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username đã tồn tại' });
    const roles = [role];
    const user = await User.create({ username, password, roles });
    res.status(201).json({ id: user.id, username: user.username, roles });
  } catch (err) {
    console.error('Lỗi tạo tài khoản:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Chỉ ADMIN mới xem được danh sách người dùng
router.get('/', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id','username','roles','createdAt'] });
  // Chuyển chuỗi JSON roles về mảng (nếu cần)
    const usersWithParsedRoles = users.map(u => {
      const roles = typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles;
      return { id: u.id, username: u.username, roles };
    });
    res.json(usersWithParsedRoles);
  } catch (err) {
    console.error('Lỗi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// XÓA user (chỉ ADMIN)
router.delete('/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    // Không cho tự xóa chính mình
    if (String(targetUser.id) === String(req.user.id)) {
      return res.status(400).json({ message: 'Không thể tự xóa chính mình' });
    }

  // Chuyển đổi roles cho cả người yêu cầu và đối tượng bị xóa
    const targetRoles = typeof targetUser.roles === 'string' ? JSON.parse(targetUser.roles) : targetUser.roles;

    // Nếu đang xóa một ADMIN, kiểm tra số lượng ADMIN còn lại
    if (Array.isArray(targetRoles) && targetRoles.includes(ROLES.ADMIN)) {
      const allUsers = await User.findAll({ attributes: ['id', 'roles'] });
      let adminCount = 0;
      for (const u of allUsers) {
        const r = typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles;
        if (Array.isArray(r) && r.includes(ROLES.ADMIN)) adminCount++;
      }
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Không thể xóa tài khoản ADMIN cuối cùng' });
      }
    }

    await targetUser.destroy();
    res.json({ message: 'Đã xóa user' });
  } catch (err) {
    console.error('Lỗi xóa người dùng:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
