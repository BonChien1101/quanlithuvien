require('dotenv').config();
const { sequelize } = require('./models');

async function addHiddenToCategory() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Kiểm tra xem cột hidden đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'categories' 
        AND COLUMN_NAME = 'hidden'
    `);

    if (results.length === 0) {
      // Thêm cột hidden vào bảng categories
      await sequelize.query(`
        ALTER TABLE categories
        ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log('thêm cột ẩn vào bảng categories thành công.');
    } else {
      console.log('cột ẩn đã tồn tại trong bảng categories, không cần thêm.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi thêm cột', error);
    process.exit(1);
  }
}

addHiddenToCategory();
