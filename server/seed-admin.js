require('dotenv').config();
const { User } = require('./models');

async function seedAdmin() {
  try {
    const username = 'admin';
    const password = 'admin';
    
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    const admin = await User.create({
      username,
      password,
      roles: ['ADMIN', 'LIBRARIAN']
    });
    
    console.log('Admin user created successfully:', admin.username);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
