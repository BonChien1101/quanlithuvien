require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');

async function testPassword() {
  try {
    const user = await User.findOne({ where: { username: 'admin' } });
    if (!user) {
      console.log('❌ User admin not found');
      process.exit(1);
    }
    
    console.log('✓ User found:', user.username);
    console.log('  Stored password hash:', user.password);
    console.log('  Roles:', user.roles);
    
    const testPass = 'admin';
    console.log('\nTesting password:', testPass);
    
    const result = await bcrypt.compare(testPass, user.password);
    console.log('Bcrypt compare result:', result);
    
    const methodResult = await user.validatePassword(testPass);
    console.log('Model method result:', methodResult);
    
    if (result) {
      console.log('\n✓ Password is correct!');
    } else {
      console.log('\n❌ Password does not match!');
      console.log('Creating new hash for "admin":');
      const newHash = await bcrypt.hash('admin', 10);
      console.log('New hash:', newHash);
      console.log('\nUpdating user password...');
      user.password = newHash;
      await user.save();
      console.log('✓ Password updated');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testPassword();
