const express = require('express');
const router = express.Router();
// TODO: Create Reader model
// For now, return empty array

// GET all readers
router.get('/', async (req, res) => {
  res.json([]);
});

// POST create reader
router.post('/', async (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

// PUT update reader
router.put('/:id', async (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

// DELETE reader
router.delete('/:id', async (req, res) => {
  res.json({ message: 'Đã xóa độc giả' });
});

module.exports = router;
