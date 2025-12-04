const { Sequelize } = require('sequelize');
const config = require('./models');

(async () => {
  try {
    const { sequelize } = require('./models');
    console.log('✓ Database connected');
    await sequelize.getQueryInterface().addColumn('books', 'imageUrl', { type: Sequelize.STRING(1024), allowNull: true });
    console.log('✓ Added imageUrl column to books table');
    process.exit(0);
  } catch (err) {
    if (err && err.original && /Duplicate column|exists/i.test(err.original.message)) {
      console.log('✓ imageUrl column already exists');
      process.exit(0);
    }
    console.error('Failed to add imageUrl:', err);
    process.exit(1);
  }
})();
