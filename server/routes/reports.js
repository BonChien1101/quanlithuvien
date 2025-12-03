const express = require('express');
const router = express.Router();
const { Loan, Book, Reader } = require('../models');
const { Op } = require('sequelize');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET /api/reports/inventory
router.get('/inventory', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
  const books = await Book.findAll({ attributes: ['id','title','stock'] });
  // Return a simple array matching client expectations: { bookId, title, stock }
  const inventory = books.map(b => ({ bookId: b.id, title: b.title, stock: b.stock }));
  res.json(inventory);
  } catch (err) {
    console.error('Lỗi báo cáo tồn kho:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/summary?period=week|month
router.get('/summary', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const period = req.query.period === 'month' ? 'month' : 'week';
    const now = new Date();
    const start = new Date(now);
    if (period === 'week') start.setDate(now.getDate() - 7); else start.setMonth(now.getMonth() - 1);
  const borrowed = await Loan.count({ where: { borrowedAt: { [Op.gte]: start } } });
  const returned = await Loan.count({ where: { returnedAt: { [Op.gte]: start } } });
    res.json({ period, start, end: now, borrowed, returned });
  } catch (err) {
    console.error('Lỗi báo cáo tổng hợp:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/reader/:id
router.get('/reader/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reader = await Reader.findByPk(id);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    const loans = await Loan.findAll({ where: { readerId: id }, include: [{ model: Book, as: 'book', attributes: ['id','title'] }] });
    res.json({ reader: { id: reader.id, name: reader.name, quota: reader.quota }, loans });
  } catch (err) {
    console.error('Lỗi báo cáo theo độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;