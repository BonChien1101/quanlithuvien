// Script để thêm cột userId vào bảng readers
require('dotenv').config();
const { sequelize } = require('./models');

async function addUserIdColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Kiểm tra xem cột đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'readers' 
      AND COLUMN_NAME = 'userId'
    `);

    if (results.length > 0) {
      console.log('cột userId đã tồn tại trong bảng readers, không cần thêm.');
      process.exit(0);
    }

    // Thêm cột userId
    await sequelize.query(`
      ALTER TABLE readers 
      ADD COLUMN userId INT UNSIGNED NULL,
      ADD CONSTRAINT fk_reader_user 
      FOREIGN KEY (userId) REFERENCES users(id) 
      ON DELETE SET NULL
    `);

    console.log('Thêm cột userId vào bảng readers thành công.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUserIdColumn();
