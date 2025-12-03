const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { authenticate, requireRole, ROLES } = require('../middleware/auth');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Lỗi lấy danh sách thể loại:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại' });
  }
});

// GET category by ID with books
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ association: 'books' }]
    });
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    res.json(category);
  } catch (error) {
    console.error('Lỗi lấy thông tin thể loại:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thể loại' });
  }
});

// POST create new category
router.post('/', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên thể loại là bắt buộc' });
    }
    
    // Kiểm tra tên thể loại đã tồn tại chưa
    const existing = await Category.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({ message: 'Thể loại "' + name + '" đã tồn tại' });
    }
    
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    console.error('Lỗi tạo thể loại:', error);
    res.status(500).json({ message: 'Lỗi khi tạo thể loại' });
  }
});

// PUT update category
router.put('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    const { name, description } = req.body;
    
    // Kiểm tra tên thể loại trùng với thể loại khác
    if (name) {
      const { Op } = require('sequelize');
      const existing = await Category.findOne({ 
        where: { 
          name: name.trim(),
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Thể loại "' + name + '" đã tồn tại' });
      }
    }
    
    await category.update({ name, description });
    res.json(category);
  } catch (error) {
    console.error('Lỗi cập nhật thể loại:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thể loại' });
  }
});

// POST toggle hidden status
router.post('/:id/toggle', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    await category.update({ hidden: !category.hidden });
    res.json(category);
  } catch (error) {
    console.error('Lỗi thay đổi trạng thái thể loại:', error);
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái thể loại' });
  }
});

// DELETE category
router.delete('/:id', authenticate, requireRole([ROLES.ADMIN, ROLES.LIBRARIAN]), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    await category.destroy();
    res.json({ message: 'Đã xóa thể loại' });
  } catch (error) {
    console.error('Lỗi xóa thể loại:', error);
    res.status(500).json({ message: 'Lỗi khi xóa thể loại' });
  }
});

module.exports = router;
