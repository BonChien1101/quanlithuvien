require('dotenv').config();
const express = require('express');
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
const myLibraryRoutes = require('./my-library');

const app = express();
app.use(cors());
app.use(express.json());
// Tắt ETag để tránh việc cache 304 cho phản hồi API
app.set('etag', false);
// Thiết lập header không cache cho tất cả route API
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // đường dẫn dự phòng
app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/readers', readersRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/my-library', myLibraryRoutes);

const port = process.env.PORT || 8080;

async function start() {
  try {
    if (!sequelize) {
      console.error('Sequelize not initialized. Models export:', Object.keys(models || {}));
      throw new Error('Đã xảy ra lỗi khi khởi động server');
    }
    await sequelize.authenticate();
    console.log('Đã kết nối đến cơ sở dữ liệu');
  // Đồng bộ models (tạo bảng nếu chưa tồn tại)
    await sequelize.sync();
    console.log('Đã đồng bộ hóa các mô hình');
    app.listen(port, () => console.log('Server listening on', port));
  } catch (err) {
    console.error('Lỗi khi khởi động server', err);
    process.exit(1);
  }
}

start();
