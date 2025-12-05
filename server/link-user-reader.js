// Script để liên kết user với reader
require('dotenv').config();
const { User, Reader } = require('./models');

async function linkUserToReader() {
  try {
    console.log('Đang kết nối database...');
    
    // Tìm user có role USER
    const users = await User.findAll();
    console.log(`Tìm thấy ${users.length} users`);
    
    for (const user of users) {
      const roles = user.roles || [];
      if (roles.includes('USER')) {
        console.log(`\nXử lý user: ${user.username}`);
        
        // Kiểm tra xem đã có reader liên kết chưa
        let reader = await Reader.findOne({ where: { userId: user.id } });
        
        if (!reader) {
          // Tạo reader mới cho user này
          reader = await Reader.create({
            name: user.username,
            email: `${user.username}@library.com`,
            quota: 5,
            userId: user.id
          });
          console.log(`✅ Đã tạo reader mới cho user ${user.username} (ID: ${reader.id})`);
        } else {
          console.log(`✓ User ${user.username} đã có reader (ID: ${reader.id})`);
        }
      }
    }
    
    console.log('\n✅ Hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

linkUserToReader();
