const express = require('express');
const router = express.Router();
const { Reader } = require('../models');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET all readers
router.get('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const readers = await Reader.findAll({ order: [['id','ASC']] });
    res.json(readers);
  } catch (err) {
    console.error('Lỗi lấy danh sách độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST create reader
router.post('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { name, contact, quota, phone, email, gender, dob, address, note } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Thiếu tên độc giả' });
    if (quota != null && quota < 0) return res.status(400).json({ message: 'Quota không hợp lệ' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
    if (gender && !['male','female','other'].includes(gender)) return res.status(400).json({ message: 'Giới tính không hợp lệ' });
    if (phone && phone.length > 20) return res.status(400).json({ message: 'SĐT quá dài' });
    const reader = await Reader.create({ name, contact, quota: quota ?? 3, phone, email, gender, dob, address, note });
    res.status(201).json(reader);
  } catch (err) {
    console.error('Lỗi tạo độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// PUT update reader
router.put('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const reader = await Reader.findByPk(req.params.id);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    const { name, contact, quota, phone, email, gender, dob, address, note } = req.body || {};
    if (quota != null && quota < 0) return res.status(400).json({ message: 'Quota không hợp lệ' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
    if (gender && !['male','female','other'].includes(gender)) return res.status(400).json({ message: 'Giới tính không hợp lệ' });
    if (phone && phone.length > 20) return res.status(400).json({ message: 'SĐT quá dài' });
    await reader.update({ name, contact, quota, phone, email, gender, dob, address, note });
    res.json(reader);
  } catch (err) {
    console.error('Lỗi cập nhật độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// DELETE reader
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const reader = await Reader.findByPk(req.params.id);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    await reader.destroy();
    res.json({ message: 'Đã xóa độc giả' });
  } catch (err) {
    console.error('Lỗi xóa độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
