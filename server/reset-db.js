require('dotenv').config();
const { sequelize, User } = require('./models');

async function resetAndSeed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');
    
    // Drop và tạo lại bảng users
    console.log('Dropping users table...');
    await User.drop();
    console.log('Creating users table...');
    await User.sync();
    
    // Tạo admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      username: 'admin',
      password: 'admin',
      roles: ['ADMIN', 'LIBRARIAN']
    });
    
    console.log('✓ Admin user created:', admin.username);
    console.log('✓ Roles:', admin.roles);
    console.log('\nYou can now login with:');
    console.log('  Username: admin');
    console.log('  Password: admin');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetAndSeed();
