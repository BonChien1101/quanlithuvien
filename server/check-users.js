require('dotenv').config();
const { sequelize, User } = require('./models');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const users = await User.findAll();
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.username} (roles: ${user.roles})`);
    });

    if (users.length === 0) {
      console.log('\n⚠️  No users found! Run seed-data.js to create users.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
