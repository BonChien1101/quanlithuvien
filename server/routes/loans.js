const express = require('express');
const router = express.Router();
const { Loan, Book, Reader } = require('../models');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET tất cả lượt mượn
router.get('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
  const loans = await Loan.findAll({ include: [{ model: Book, as: 'book', attributes: ['id','title'] }, { model: Reader, as: 'reader', attributes: ['id','name'] }], order: [['id','DESC']] });
  // Bổ sung thuộc tính tính toán isOverdue
    const result = loans.map(l => {
      const dueMs = l.dueAt ? new Date(l.dueAt).getTime() : null;
      const retMs = l.returnedAt ? new Date(l.returnedAt).getTime() : null;
      const nowMs = Date.now();
      const isOverdue = dueMs !== null && ((retMs ?? nowMs) > dueMs); // isOverdue là sách chưa trả và đã quá hạn hoặc đã trả nhưng trả trễ
      return { ...l.toJSON(), isOverdue };
    });
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách lượt mượn:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET lượt mượn theo độc giả
router.get('/reader/:readerId', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN, ROLES.USER]), async (req, res) => {
  try {
  const loans = await Loan.findAll({ where: { readerId: req.params.readerId }, include: [{ model: Book, as: 'book', attributes: ['id','title'] }] });
    res.json(loans);
  } catch (err) {
    console.error('Lỗi lấy lượt mượn theo độc giả:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST mượn sách
router.post('/borrow', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN, ROLES.USER]), async (req, res) => {
  try {
    const { bookId, readerId, dueAt } = req.body || {};
    if (!bookId || !readerId) return res.status(400).json({ message: 'Thiếu thông tin bookId/readerId' });
    const book = await Book.findByPk(bookId);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
    if ((book.stock || 0) <= 0) return res.status(400).json({ message: 'Sách đã hết hàng' });
  const reader = await Reader.findByPk(readerId);
    if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả' });
  // Chặn khi quota <= 0
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

// POST trả sách
router.post('/:id/return', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN, ROLES.USER]), async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, { include: [{ model: Book, as: 'book' }] });
    if (!loan) return res.status(404).json({ message: 'Không tìm thấy lượt mượn' });
    if (loan.returnedAt) return res.status(400).json({ message: 'Lượt mượn đã được trả' });
  await loan.update({ returnedAt: new Date() });
    if (loan.book) {
      await loan.book.update({ stock: (loan.book.stock || 0) + 1 });
    }
  // Xử lý quota: nếu quá hạn (trả sau dueAt) thì không cộng; ngược lại +1
    const reader = await Reader.findByPk(loan.readerId);
    if (reader) {
      const returnedAt = loan.returnedAt ? new Date(loan.returnedAt).getTime() : Date.now();
      const dueAtMs = loan.dueAt ? new Date(loan.dueAt).getTime() : null;
      const isOverdue = dueAtMs !== null && returnedAt > dueAtMs;
      const current = reader.quota || 0;
      const nextQuota = isOverdue ? current - 0 : current + 1;
      await reader.update({ quota: nextQuota });
    }
    res.json(loan);
  } catch (err) {
    console.error('Lỗi trả sách:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// PUT cập nhật hạn trả (dueAt)
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

// DELETE lượt mượn
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, { include: [{ model: Book, as: 'book' }] });
    if (!loan) return res.status(404).json({ message: 'Không tìm thấy lượt mượn' });
  // Nếu xóa lượt mượn còn hiệu lực, hoàn trả tồn kho
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
