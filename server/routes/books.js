const express = require('express');
const router = express.Router();
const { Book, Category } = require('../models');
const { Op } = require('sequelize');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET tất cả sách (có thể lọc theo category)
router.get('/', async (req, res) => {
  try {
    const { categoryId, includeHidden } = req.query;
    const page = Math.max(parseInt(String(req.query.page || 1), 10), 1);
    const limit = Math.max(parseInt(String(req.query.limit || 10), 10), 1);
    const offset = (page - 1) * limit;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
  // Mặc định loại trừ sách bị ẩn trừ khi yêu cầu hiển thị
    if (includeHidden === '0' || includeHidden === 'false') {
      where.hidden = { [Op.not]: true };
      where.hiddenByCategory = { [Op.not]: true };
    } else if (includeHidden === '1' || includeHidden === 'true') {
      // Nếu lấy danh sách đã ẩn, lọc cả hidden hoặc hiddenByCategory
      where[Op.or] = [
        { hidden: true },
        { hiddenByCategory: true }
      ];
    } // Nếu includeHidden === '2' hoặc undefined thì KHÔNG lọc gì, trả về tất cả
    const { rows, count } = await Book.findAndCountAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['title', 'ASC']],
      limit,
      offset
    });
    res.json({ items: rows, total: count, page, pageCount: Math.max(Math.ceil(count/limit),1), limit });
  } catch (err) {
    console.error('Lỗi lấy danh sách sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET tìm kiếm sách theo tiêu đề hoặc tác giả
router.get('/search', async (req, res) => {
  try {
  const { title, author, includeHidden } = req.query;
  const page = Math.max(parseInt(String(req.query.page || 1), 10), 1);
  const limit = Math.max(parseInt(String(req.query.limit || 10), 10), 1);
  const offset = (page - 1) * limit;
  const where = {};
    
    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }
    if (author) {
      where.author = { [Op.like]: `%${author}%` };
    }
    // không hiện sách đã ẩn trừ khi yêu cầu rõ ràng
    if (!includeHidden || includeHidden === '0' || includeHidden === 'false') {
      where.hidden = { [Op.not]: true };
    }
    const { rows, count } = await Book.findAndCountAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['title', 'ASC']],
      limit,
      offset
    });
    res.json({ items: rows, total: count, page, pageCount: Math.max(Math.ceil(count/limit),1), limit });
  } catch (err) {
    console.error('Lỗi tìm kiếm sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET sách theo ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    res.json(book);
  } catch (err) {
    console.error('Lỗi lấy thông tin sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST tạo sách mới
router.post('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { code, title, author, imageUrl, stock, categoryId } = req.body;
    if (!code || !title || !author) {
      return res.status(400).json({ message: 'Phải nhập đầy đủ thông tin' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Phải chọn thể loại' });
    }
    const book = await Book.create({ code, title, author, imageUrl, stock: Number.isFinite(stock) ? stock : 0, categoryId });
    res.status(201).json(book);
  } catch (err) {
    console.error('Lỗi tạo sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT cập nhật sách
router.put('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
  const { code, title, author, imageUrl, stock, categoryId } = req.body;
  await book.update({ code, title, author, imageUrl, stock, categoryId });
    res.json(book);
  } catch (err) {
    console.error('Lỗi cập nhật sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST chuyển đổi trạng thái ẩn/hiện
router.post('/:id/toggle', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    await book.update({ hidden: !book.hidden });
    res.json(book);
  } catch (err) {
    console.error('Lỗi thay đổi trạng thái sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE sách (chỉ ADMIN)
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    await book.destroy();
    res.json({ message: 'Đã xóa sách' });
  } catch (err) {
    console.error('Lỗi xóa sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
