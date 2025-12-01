require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const readersRoutes = require('./routes/readers');
const loansRoutes = require('./routes/loans');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // fallback path
app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/readers', readersRoutes);
app.use('/api/loans', loansRoutes);

const port = process.env.PORT || 8080;

async function start() {
  try {
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
