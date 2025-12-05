const express = require('express');
const router = express.Router();
const { Reader } = require('../models');
const { Op } = require('sequelize');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET tất cả độc giả
router.get('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { q } = req.query;
    const page = Math.max(parseInt(String(req.query.page || 1), 10), 1);
    const limit = Math.max(parseInt(String(req.query.limit || 10), 10), 1);
    const offset = (page - 1) * limit;
    const term = q && String(q).trim();
    const where = term ? { [Op.or]: [
      { name: { [Op.like]: `%${term}%` } },
      { phone: { [Op.like]: `%${term}%` } },
      { contact: { [Op.like]: `%${term}%` } },
      { email: { [Op.like]: `%${term}%` } },
      { address: { [Op.like]: `%${term}%` } },
  // Chuẩn hóa phone/contact: bỏ khoảng trắng và dấu gạch trước khi so khớp
      require('../models').sequelize.where(
        require('../models').sequelize.fn('REPLACE', require('../models').sequelize.fn('REPLACE', require('../models').sequelize.col('phone'), ' ', ''), '-', ''),
        { [Op.like]: `%${String(term).replace(/[-\s]/g,'')}%` }
      ),
      require('../models').sequelize.where(
        require('../models').sequelize.fn('REPLACE', require('../models').sequelize.fn('REPLACE', require('../models').sequelize.col('contact'), ' ', ''), '-', ''),
        { [Op.like]: `%${String(term).replace(/[-\s]/g,'')}%` }
      )
    ] } : {};
  const { rows, count } = await Reader.findAndCountAll({ where, order: [['id','ASC']], limit, offset });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({ items: rows, total: count, page, pageCount: Math.max(Math.ceil(count/limit),1), limit });
  } catch (err) {
    console.error('Lỗi lấy danh sách độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET độc giả theo id
router.get('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const reader = await Reader.findByPk(req.params.id);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(reader);
  } catch (err) {
    console.error('Lỗi lấy độc giả theo id:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST tạo độc giả
router.post('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { name, contact, quota, phone, email, gender, dob, address, note } = req.body || {};
    // Bắt buộc các trường (ngoại trừ ghi chú là tùy chọn)
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Thiếu tên độc giả' });
    if (!phone || !String(phone).trim()) return res.status(400).json({ message: 'Thiếu số điện thoại' });
    if (!email || !String(email).trim()) return res.status(400).json({ message: 'Thiếu email' });
    if (!gender || !String(gender).trim()) return res.status(400).json({ message: 'Thiếu giới tính' });
    if (!dob || !String(dob).trim()) return res.status(400).json({ message: 'Thiếu ngày sinh' });
    if (!address || !String(address).trim()) return res.status(400).json({ message: 'Thiếu địa chỉ' });
    if (quota == null) return res.status(400).json({ message: 'Thiếu quota' });
    if (Number(quota) < 0) return res.status(400).json({ message: 'Quota không hợp lệ' });
  // Kiểm tra tính hợp lệ của dữ liệu
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ message: 'Email không hợp lệ' });
    if (!['male','female','other'].includes(String(gender))) return res.status(400).json({ message: 'Giới tính không hợp lệ' });
    if (String(phone).length > 20) return res.status(400).json({ message: 'SĐT quá dài' });
    const dobDate = new Date(String(dob));
    if (isNaN(dobDate.getTime())) return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
    const reader = await Reader.create({
      name: String(name).trim(),
      contact: contact != null && String(contact).trim() ? String(contact).trim() : null,
      phone: String(phone).trim(),
      email: String(email).trim(),
      gender: String(gender),
      dob: String(dob),
      address: String(address).trim(),
      quota: Number(quota),
      note: note != null && String(note).trim() ? String(note).trim() : null,
    });
    res.status(201).json(reader);
  } catch (err) {
    console.error('Lỗi tạo độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// PUT cập nhật độc giả
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

// DELETE độc giả (chỉ ADMIN)
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN]), async (req, res) => {
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
