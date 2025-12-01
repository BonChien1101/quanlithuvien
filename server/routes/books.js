const express = require('express');
const router = express.Router();
const { Book, Category } = require('../models');
const { Op } = require('sequelize');

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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create new book
router.post('/', async (req, res) => {
  try {
    const { code, title, author, stock, categoryId } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Tên sách là bắt buộc' });
    }
    const book = await Book.create({ code, title, author, stock: stock || 0, categoryId });
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    const { code, title, author, stock, categoryId } = req.body;
    await book.update({ code, title, author, stock, categoryId });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST toggle hidden status
router.post('/:id/toggle', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    await book.update({ hidden: !book.hidden });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    await book.destroy();
    res.json({ message: 'Đã xóa sách' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
