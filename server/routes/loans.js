const express = require('express');
const router = express.Router();
const { Loan, Book, Reader } = require('../models');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET all loans
router.get('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
  const loans = await Loan.findAll({ include: [{ model: Book, as: 'book', attributes: ['id','title'] }, { model: Reader, as: 'reader', attributes: ['id','name'] }], order: [['id','DESC']] });
    res.json(loans);
  } catch (err) {
    console.error('Lỗi lấy danh sách lượt mượn:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET loans by reader
router.get('/reader/:readerId', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN, ROLES.USER]), async (req, res) => {
  try {
  const loans = await Loan.findAll({ where: { readerId: req.params.readerId }, include: [{ model: Book, as: 'book', attributes: ['id','title'] }] });
    res.json(loans);
  } catch (err) {
    console.error('Lỗi lấy lượt mượn theo độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST borrow book
router.post('/borrow', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { bookId, readerId, dueAt } = req.body || {};
    if (!bookId || !readerId) return res.status(400).json({ message: 'Thiếu thông tin bookId/readerId' });
    const book = await Book.findByPk(bookId);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
    if ((book.stock || 0) <= 0) return res.status(400).json({ message: 'Sách đã hết hàng' });
  const reader = await Reader.findByPk(readerId);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
  // Block when quota is 0 or less
  if ((reader.quota || 0) <= 0) return res.status(400).json({ message: 'Độc giả đã hết quota, không thể mượn thêm' });
  //chỉ chặn khi quota <= 0, không xét số lượt đang mượn
    await book.update({ stock: (book.stock || 0) - 1 });
  await reader.update({ quota: (reader.quota || 0) - 1 });
  const loan = await Loan.create({ bookId, readerId, borrowedAt: new Date(), dueAt: dueAt ? new Date(dueAt) : null });
    res.status(201).json(loan);
  } catch (err) {
    console.error('Lỗi tạo lượt mượn:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST return book
router.post('/:id/return', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, { include: [{ model: Book, as: 'book' }] });
    if (!loan) return res.status(404).json({ message: 'Không tìm thấy lượt mượn' });
    if (loan.returnedAt) return res.status(400).json({ message: 'Lượt mượn đã được trả' });
    await loan.update({ returnedAt: new Date() });
    if (loan.book) {
      await loan.book.update({ stock: (loan.book.stock || 0) + 1 });
    }
    // Restore reader quota by 1 on return
    const reader = await Reader.findByPk(loan.readerId);
    if (reader) {
      await reader.update({ quota: (reader.quota || 0) + 1 });
    }
    res.json(loan);
  } catch (err) {
    console.error('Lỗi trả sách:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// PUT update due date
router.put('/:id/due', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { dueAt } = req.body || {};
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Không tìm thấy lượt mượn' });
    if (loan.returnedAt) return res.status(400).json({ message: 'Lượt mượn đã trả, không thể cập nhật hạn trả' });
    await loan.update({ dueAt: dueAt ? new Date(dueAt) : null });
    res.json(loan);
  } catch (err) {
    console.error('Lỗi cập nhật hạn trả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// DELETE loan
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, { include: [{ model: Book, as: 'book' }] });
    if (!loan) return res.status(404).json({ message: 'Không tìm thấy lượt mượn' });
    // If deleting an active loan, restore stock
    if (!loan.returnedAt && loan.book) {
      await loan.book.update({ stock: (loan.book.stock || 0) + 1 });
    }
    await loan.destroy();
    res.json({ message: 'Đã xóa lượt mượn' });
  } catch (err) {
    console.error('Lỗi xóa lượt mượn:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
