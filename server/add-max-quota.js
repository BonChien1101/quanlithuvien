// Script để thêm cột maxQuota vào bảng readers
require('dotenv').config();
const { sequelize, Reader } = require('./models');

async function addMaxQuota() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Kiểm tra xem cột đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'readers' 
      AND COLUMN_NAME = 'maxQuota'
    `);

    if (results.length > 0) {
      console.log('Column maxQuota already exists');
      process.exit(0);
    }

    // Thêm cột maxQuota
    await sequelize.query(`
      ALTER TABLE readers 
      ADD COLUMN maxQuota INT UNSIGNED NOT NULL DEFAULT 3 AFTER quota
    `);

    console.log('Successfully added maxQuota column');

    // Cập nhật maxQuota = quota hiện tại cho các reader đã có
    await sequelize.query(`
      UPDATE readers 
      SET maxQuota = quota 
      WHERE maxQuota = 3
    `);

    console.log('Updated maxQuota for existing readers');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addMaxQuota();
