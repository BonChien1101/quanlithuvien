require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models/index.js');
const sequelize = models && models.sequelize;

const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const readersRoutes = require('./routes/readers');
const loansRoutes = require('./routes/loans');
const reportsRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Disable ETag to avoid 304 caching for API responses
app.set('etag', false);
// Global no-cache headers for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // fallback path
app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/readers', readersRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/reports', reportsRoutes);

const port = process.env.PORT || 8080;

async function start() {
  try {
    if (!sequelize) {
      console.error('Sequelize not initialized. Models export:', Object.keys(models || {}));
      throw new Error('sequelize is undefined from ./models');
    }
    await sequelize.authenticate();
    console.log('Database connected');
    // sync models (create tables if not exist)
    await sequelize.sync();
    console.log('Models synced');
    app.listen(port, () => console.log('Server listening on', port));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
