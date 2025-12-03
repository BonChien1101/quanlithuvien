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
        ADD COLUMN hidden TINYINT(1) DEFAULT 0
      `);
      console.log('✓ Added hidden column to categories table');
    } else {
      console.log('✓ Hidden column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addHiddenToCategory();
