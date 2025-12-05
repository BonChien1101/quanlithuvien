require('dotenv').config();
const { sequelize } = require('./models');

async function dropAllTables() {
  try {
    await sequelize.authenticate();
    console.log('Đã kết nối đến cơ sở dữ liệu');

    // Tắt foreign key check
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Chuyển foreign key checks sang OFF');

    // Lấy danh sách tất cả các bảng
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
    );

    // Drop tất cả các bảng
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`  Dropped table: ${tableName}`);
    }

    // Bật lại foreign key check
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Có lỗi xảy ra khi bật lại foreign key checks.');

    console.log('\nXoá tất cả các bảng thành công.');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi', error);
    process.exit(1);
  }
}

dropAllTables();
