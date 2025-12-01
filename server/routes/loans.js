const express = require('express');
const router = express.Router();
// TODO: Create Loan model
// For now, return empty array

// GET all loans
router.get('/', async (req, res) => {
  res.json([]);
});

// GET loans by reader
router.get('/reader/:readerId', async (req, res) => {
  res.json([]);
});

// POST borrow book
router.post('/borrow', async (req, res) => {
  const { bookId, readerId } = req.query;
  res.status(201).json({ 
    id: 1, 
    bookId, 
    readerId, 
    borrowedAt: new Date().toISOString() 
  });
});

// POST return book
router.post('/:id/return', async (req, res) => {
  res.json({ 
    id: req.params.id, 
    returnedAt: new Date().toISOString() 
  });
});

// PUT update due date
router.put('/:id/due', async (req, res) => {
  const { epochMilli } = req.query;
  res.json({ 
    id: req.params.id, 
    dueAt: new Date(parseInt(epochMilli)).toISOString() 
  });
});

// DELETE loan
router.delete('/:id', async (req, res) => {
  res.json({ message: 'Đã xóa lượt mượn' });
});

module.exports = router;
