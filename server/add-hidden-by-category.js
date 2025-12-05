require('dotenv').config();
const { sequelize } = require('./models');

async function addHiddenByCategoryColumn() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Kiểm tra xem cột hiddenByCategory đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'books' 
        AND COLUMN_NAME = 'hiddenByCategory'
    `);

    if (results.length === 0) {
      // Thêm cột hiddenByCategory vào bảng books
      await sequelize.query(`
        ALTER TABLE books 
        ADD COLUMN hiddenByCategory TINYINT(1) DEFAULT 0
      `);
      console.log('✓ Added hiddenByCategory column to books table');
    } else {
      console.log('✓ hiddenByCategory column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addHiddenByCategoryColumn();
