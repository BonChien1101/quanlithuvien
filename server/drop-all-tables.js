require('dotenv').config();
const { sequelize } = require('./models');

async function dropAllTables() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Tắt foreign key check
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');

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
    console.log('✓ Enabled foreign key checks');

    console.log('\n✅ All tables dropped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropAllTables();
