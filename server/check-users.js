require('dotenv').config();
const { sequelize, User } = require('./models');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Đã kết nối đến cơ sở dữ liệu');

    const users = await User.findAll();
    console.log(`\nTìm thấy ${users.length} người dùng:`);
    users.forEach(user => {
      console.log(`  - ${user.username} (roles: ${user.roles})`);
    });

    if (users.length === 0) {
      console.log('\nKhông tìm thấy người dùng nào trong cơ sở dữ liệu. Vui lòng tạo tài khoản admin đầu tiên.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Lỗi', error);
    process.exit(1);
  }
}

checkUsers();
