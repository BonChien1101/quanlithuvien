require('dotenv').config();
const { User } = require('./models');

(async function resetAdmin(){
  try{
    const username = 'admin';
    const password = 'admin';
    const existing = await User.findOne({ where: { username } });
    if(existing){
      await existing.destroy();
      console.log('Đã xóa admin cũ');
    }
    const admin = await User.create({ username, password, roles: ['ADMIN'] });
    console.log('Tạo lại admin thành công:', admin.username);
    process.exit(0);
  }catch(err){
    console.error('Lỗi reset admin:', err);
    process.exit(1);
  }
})();
