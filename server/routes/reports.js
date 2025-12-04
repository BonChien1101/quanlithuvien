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

// GET /api/reports/inventory/low -> sách sắp hết (stock ≤ 3)
router.get('/inventory/low', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const threshold = parseInt(String(req.query.threshold || 3), 10);
    const books = await Book.findAll({ attributes: ['id','title','stock'], where: { stock: { [Op.lte]: threshold } }, order: [['stock','ASC']] });
    res.json(books.map(b=>({ bookId: b.id, title: b.title, stock: b.stock })));
  } catch (err) {
    console.error('Lỗi báo cáo sách sắp hết:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/overview -> tổng quan hoạt động trong khoảng thời gian (mặc định 30 ngày gần nhất)
router.get('/overview', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const now = new Date();
    const { start: startQ, end: endQ } = req.query;
    let start = startQ ? new Date(String(startQ)) : new Date(now);
    let end = endQ ? new Date(String(endQ)) : new Date(now);
    if (!startQ) start.setDate(now.getDate() - 30);
    // Tổng số lượt mượn
    const totalBorrowed = await Loan.count({ where: { borrowedAt: { [Op.between]: [start, end] } } });
    // Tổng số lượt trả
    const totalReturned = await Loan.count({ where: { returnedAt: { [Op.between]: [start, end] } } });
    // Tổng số bạn đọc phát sinh giao dịch
    const readersBorrowed = await Loan.findAll({ attributes: [[require('../models').sequelize.fn('DISTINCT', require('../models').sequelize.col('readerId')), 'readerId']], where: { borrowedAt: { [Op.between]: [start, end] } } });
    const readersReturned = await Loan.findAll({ attributes: [[require('../models').sequelize.fn('DISTINCT', require('../models').sequelize.col('readerId')), 'readerId']], where: { returnedAt: { [Op.between]: [start, end] } } });
    const readerIds = new Set([ ...readersBorrowed.map(r=>r.get('readerId')), ...readersReturned.map(r=>r.get('readerId')) ]);
    const totalActiveReaders = readerIds.size;
    // Tổng số sách khác nhau được mượn
    const distinctBooks = await Loan.findAll({ attributes: [[require('../models').sequelize.fn('DISTINCT', require('../models').sequelize.col('bookId')), 'bookId']], where: { borrowedAt: { [Op.between]: [start, end] } } });
    const totalDistinctBooksBorrowed = distinctBooks.length;
    res.json({ start: start.toISOString(), end: end.toISOString(), totalBorrowed, totalReturned, totalActiveReaders, totalDistinctBooksBorrowed });
  } catch (err) {
    console.error('Lỗi tổng quan hoạt động:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});
// GET /api/reports/summary?period=week|month
router.get('/summary', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const period = req.query.period === 'month' ? 'month' : 'week';
    const now = new Date();
    let start;
    let end;
    // Accept explicit start/end ISO dates or year/month
    const { start: startQ, end: endQ, year, month } = req.query;
    if (startQ || endQ) {
      start = startQ ? new Date(String(startQ)) : new Date(now);
      end = endQ ? new Date(String(endQ)) : new Date(now);
    } else if (period === 'month' && year && month) {
      const y = parseInt(String(year), 10);
      const m = parseInt(String(month), 10);
      if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12 || y <2000 || y > 3000) {
        return res.status(400).json({ message: 'Tham số năm/tháng không hợp lệ' });
      }
      start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      end = new Date(Date.UTC(y, m, 0, 23, 59, 59));
    } else {
      // Default last week/month until now
      end = now;
      start = new Date(now);
      if (period === 'week') start.setDate(now.getDate() - 7); else start.setMonth(now.getMonth() - 1);
    }
  const borrowed = await Loan.count({ where: { borrowedAt: { [Op.between]: [start, end] } } });
  const returned = await Loan.count({ where: { returnedAt: { [Op.between]: [start, end] } } });
  res.json({ period, start: start.toISOString(), end: end.toISOString(), borrowed, returned });
  } catch (err) {
    console.error('Lỗi báo cáo tổng hợp:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/reader/:id
// Ensure only numeric IDs are accepted and guard against NaN
router.get('/reader/:id(\\d+)', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID độc giả không hợp lệ' });
    }
    const reader = await Reader.findByPk(id);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    const loans = await Loan.findAll({ where: { readerId: id }, include: [{ model: Book, as: 'book', attributes: ['id','title'] }] });
    const readerInfo = {
      id: reader.id,
      name: reader.name,
      quota: reader.quota,
      phone: reader.phone,
      email: reader.email,
      contact: reader.contact,
      gender: reader.gender,
      dob: reader.dob,
      address: reader.address,
      note: reader.note,
    };
    res.json({ reader: readerInfo, loans });
  } catch (err) {
    console.error('Lỗi báo cáo theo độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});


// GET /api/reports/top-books?limit=5&start=&end= -> Top N sách được mượn
router.get('/top-books', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit || 5), 10);
    const now = new Date();
    const start = req.query.start ? new Date(String(req.query.start)) : new Date(now.setDate(now.getDate()-30));
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();
    const rows = await Loan.findAll({
      attributes: ['bookId', [require('../models').sequelize.fn('COUNT', require('../models').sequelize.col('id')), 'count']],
      where: { borrowedAt: { [Op.between]: [start, end] } },
      group: ['bookId'],
      order: [[require('../models').sequelize.literal('count'), 'DESC']],
      limit,
      raw: true
    });
    // fetch titles separately to avoid GROUP + include issues
    const results = [];
    for (const r of rows) {
      const bookId = r.bookId;
      const count = parseInt(String(r.count ?? r['count']), 10) || 0;
      const b = await Book.findByPk(bookId, { attributes: ['title'], raw: true });
      results.push({ bookId, title: b?.title || '(Không rõ)', count });
    }
    res.json(results);
  } catch (err) {
    console.error('Lỗi top sách:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/borrow-stats?days=7 -> số lượt mượn theo từng ngày
router.get('/borrow-stats', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const days = parseInt(String(req.query.days || 7), 10);
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate() - days + 1);
    const S = require('../models').sequelize;
    const rows = await Loan.findAll({
      attributes: [
        [S.fn('DATE_FORMAT', S.col('borrowedAt'), '%Y-%m-%d'), 'date'],
        [S.fn('COUNT', S.col('id')), 'count']
      ],
      where: { borrowedAt: { [Op.between]: [start, end] } },
      group: [S.fn('DATE_FORMAT', S.col('borrowedAt'), '%Y-%m-%d')],
      order: [[S.fn('DATE_FORMAT', S.col('borrowedAt'), '%Y-%m-%d'), 'ASC']],
      raw: true
    });
    res.json(rows.map(r=>({ date: r.date, count: parseInt(String(r.count),10) })));
  } catch (err) {
    console.error('Lỗi thống kê mượn theo ngày:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;