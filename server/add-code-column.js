require('dotenv').config();
const { sequelize } = require('./models');

async function addCodeColumn() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Kiểm tra xem cột code đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'books' 
        AND COLUMN_NAME = 'code'
    `);

    if (results.length === 0) {
      // Thêm cột code vào bảng books
      await sequelize.query(`
        ALTER TABLE books 
        ADD COLUMN code VARCHAR(50) NULL
      `);
      console.log('✓ Added code column to books table');
    } else {
      console.log('✓ Code column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addCodeColumn();
