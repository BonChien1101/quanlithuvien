const express = require('express');
const router = express.Router();
const { Reader } = require('../models');
const { Op } = require('sequelize');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET all readers
router.get('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { q } = req.query;
    const term = q && String(q).trim();
    const where = term ? { [Op.or]: [
      { name: { [Op.like]: `%${term}%` } },
      { phone: { [Op.like]: `%${term}%` } },
      { contact: { [Op.like]: `%${term}%` } },
      { email: { [Op.like]: `%${term}%` } },
      { address: { [Op.like]: `%${term}%` } },
      // normalized phone/contact: remove spaces and dashes before matching
      require('../models').sequelize.where(
        require('../models').sequelize.fn('REPLACE', require('../models').sequelize.fn('REPLACE', require('../models').sequelize.col('phone'), ' ', ''), '-', ''),
        { [Op.like]: `%${String(term).replace(/[-\s]/g,'')}%` }
      ),
      require('../models').sequelize.where(
        require('../models').sequelize.fn('REPLACE', require('../models').sequelize.fn('REPLACE', require('../models').sequelize.col('contact'), ' ', ''), '-', ''),
        { [Op.like]: `%${String(term).replace(/[-\s]/g,'')}%` }
      )
    ] } : {};
  const readers = await Reader.findAll({ where, order: [['id','ASC']] });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json(readers);
  } catch (err) {
    console.error('Lỗi lấy danh sách độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET reader by id
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

// POST create reader
router.post('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { name, contact, quota, phone, email, gender, dob, address, note } = req.body || {};
  // Require all fields to be provided (non-empty)
  if (!name || !String(name).trim()) return res.status(400).json({ message: 'Thiếu tên độc giả' });
  if (!contact || !String(contact).trim()) return res.status(400).json({ message: 'Thiếu thông tin liên hệ' });
  if (!phone || !String(phone).trim()) return res.status(400).json({ message: 'Thiếu số điện thoại' });
  if (!email || !String(email).trim()) return res.status(400).json({ message: 'Thiếu email' });
  if (!gender || !String(gender).trim()) return res.status(400).json({ message: 'Thiếu giới tính' });
  if (!dob || !String(dob).trim()) return res.status(400).json({ message: 'Thiếu ngày sinh' });
  if (!address || !String(address).trim()) return res.status(400).json({ message: 'Thiếu địa chỉ' });
  if (note == null || !String(note).trim()) return res.status(400).json({ message: 'Thiếu ghi chú' });
  if (quota == null) return res.status(400).json({ message: 'Thiếu quota' });
  if (Number(quota) < 0) return res.status(400).json({ message: 'Quota không hợp lệ' });
  // Field validations
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ message: 'Email không hợp lệ' });
  if (!['Nam','Nữ','Khác'].includes(String(gender))) return res.status(400).json({ message: 'Giới tính không hợp lệ' });
  if (String(phone).length > 20) return res.status(400).json({ message: 'SĐT quá dài' });
  const dobDate = new Date(String(dob));
  if (isNaN(dobDate.getTime())) return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
  const reader = await Reader.create({ name: String(name).trim(), contact: String(contact).trim(), quota: Number(quota), phone: String(phone).trim(), email: String(email).trim(), gender: String(gender), dob: String(dob), address: String(address).trim(), note: String(note).trim() });
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
