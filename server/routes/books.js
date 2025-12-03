const express = require('express');
const router = express.Router();
const { Book, Category } = require('../models');
const { Op } = require('sequelize');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET all books with optional category filter
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId } : {};
    
    const books = await Book.findAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['title', 'ASC']]
    });
    res.json(books);
  } catch (err) {
    console.error('Lỗi lấy danh sách sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET search books by title or author
router.get('/search', async (req, res) => {
  try {
    const { title, author } = req.query;
    const where = {};
    
    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }
    if (author) {
      where.author = { [Op.like]: `%${author}%` };
    }
    
    const books = await Book.findAll({
      where,
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['title', 'ASC']]
    });
    res.json(books);
  } catch (err) {
    console.error('Lỗi tìm kiếm sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET book by ID
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

// POST create new book
router.post('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { code, title, author, stock, categoryId } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Tên sách là bắt buộc' });
    }
    const book = await Book.create({ code, title, author, stock: stock || 0, categoryId });
    res.status(201).json(book);
  } catch (err) {
    console.error('Lỗi tạo sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update book
router.put('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    const { code, title, author, stock, categoryId } = req.body;
    await book.update({ code, title, author, stock, categoryId });
    res.json(book);
  } catch (err) {
    console.error('Lỗi cập nhật sách:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST toggle hidden status
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

// DELETE book
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
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
