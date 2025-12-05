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

// GET /api/reports/dashboard-stats
router.get('/dashboard-stats', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    // Tổng số sách, độc giả, lượt mượn
    const totalBooks = await Book.count();
    const totalReaders = await Reader.count();
    const totalLoans = await Loan.count();
    
    // Số sách đang được mượn (chưa trả)
    const borrowedBooks = await Loan.count({ where: { returnedAt: null } });
    
    // Số sách quá hạn (dueAt < now và chưa trả)
    const now = new Date();
    const overdueBooks = await Loan.count({ 
      where: { 
        returnedAt: null,
        dueAt: { [Op.lt]: now, [Op.ne]: null }
      } 
    });
    
    // Số sách sắp hết (stock <= 5)
    const lowStockBooks = await Book.count({ where: { stock: { [Op.lte]: 5, [Op.gt]: 0 } } });
    
    // Số sách hết hàng (stock = 0)
    const outOfStockBooks = await Book.count({ where: { stock: 0 } });
    
    res.json({
      totalBooks,
      totalReaders,
      totalLoans,
      borrowedBooks,
      overdueBooks,
      lowStockBooks,
      outOfStockBooks
    });
  } catch (err) {
    console.error('Lỗi lấy thống kê dashboard:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/loan-trends - Thống kê xu hướng mượn/trả theo ngày (7 ngày gần nhất)
router.get('/loan-trends', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const days = 7;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const borrowed = await Loan.count({
        where: {
          borrowedAt: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });
      
      const returned = await Loan.count({
        where: {
          returnedAt: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });
      
      trends.push({
        date: date.toISOString().split('T')[0],
        borrowed,
        returned
      });
    }
    
    res.json(trends);
  } catch (err) {
    console.error('Lỗi lấy xu hướng mượn/trả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;