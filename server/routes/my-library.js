const express = require('express');
const router = express.Router();
const { Loan, Book, Reader } = require('../models');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');

// GET /api/my-library/profile - Lấy thông tin cá nhân của USER
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Tìm reader theo userId
    const reader = await Reader.findOne({ where: { userId } });
    
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bạn đọc' });
    }
    
    // Đếm số sách đang mượn
    const borrowedCount = await Loan.count({
      where: {
        readerId: reader.id,
        returnedAt: null
      }
    });
    
    // Đếm số sách quá hạn
    const now = new Date();
    const overdueCount = await Loan.count({
      where: {
        readerId: reader.id,
        returnedAt: null,
        dueAt: { [Op.lt]: now, [Op.ne]: null }
      }
    });
    
    res.json({
      reader: {
        id: reader.id,
        name: reader.name,
        email: reader.email,
        phone: reader.phone,
        quota: reader.quota,
        maxQuota: reader.maxQuota
      },
      stats: {
        borrowedCount,
        overdueCount,
        availableQuota: reader.quota
      }
    });
  } catch (err) {
    console.error('Lỗi lấy thông tin cá nhân:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/my-library/current-loans - Lấy danh sách sách đang mượn
router.get('/current-loans', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const reader = await Reader.findOne({ where: { userId } });
    
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bạn đọc' });
    }
    
    const loans = await Loan.findAll({
      where: {
        readerId: reader.id,
        returnedAt: null
      },
      include: [{
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'author', 'code']
      }],
      order: [['borrowedAt', 'DESC']]
    });
    
    res.json(loans);
  } catch (err) {
    console.error('Lỗi lấy sách đang mượn:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/my-library/loan-history - Lấy lịch sử mượn sách
router.get('/loan-history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const reader = await Reader.findOne({ where: { userId } });
    
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bạn đọc' });
    }
    
    const loans = await Loan.findAll({
      where: {
        readerId: reader.id,
        returnedAt: { [Op.ne]: null }
      },
      include: [{
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'author', 'code']
      }],
      order: [['returnedAt', 'DESC']],
      limit: 50
    });
    
    res.json(loans);
  } catch (err) {
    console.error('Lỗi lấy lịch sử mượn:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST /api/my-library/request-borrow - USER đặt mượn sách
router.post('/request-borrow', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, dueAt } = req.body || {};
    
    if (!bookId) {
      return res.status(400).json({ message: 'Thiếu thông tin sách' });
    }
    
    // Tìm reader
    const reader = await Reader.findOne({ where: { userId } });
    if (!reader) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bạn đọc' });
    }
    
    // Kiểm tra quota
    if ((reader.quota || 0) <= 0) {
      return res.status(400).json({ message: 'Bạn đã hết quota mượn sách' });
    }
    
    // Kiểm tra sách
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    
    if (book.hidden) {
      return res.status(400).json({ message: 'Sách này đang bị ẩn' });
    }
    
    if ((book.stock || 0) <= 0) {
      return res.status(400).json({ message: 'Sách đã hết trong kho' });
    }
    
    // Tạo loan tự động
    await book.update({ stock: (book.stock || 0) - 1 });
    await reader.update({ quota: (reader.quota || 0) - 1 });
    
    const loan = await Loan.create({
      bookId,
      readerId: reader.id,
      borrowedAt: new Date(),
      dueAt: dueAt ? new Date(dueAt) : null
    });
    
    res.status(201).json({
      message: 'Đặt mượn sách thành công! Vui lòng đến thư viện lấy sách.',
      loan
    });
  } catch (err) {
    console.error('Lỗi đặt mượn sách:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
