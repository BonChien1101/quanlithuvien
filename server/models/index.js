const { Sequelize } = require('sequelize');
require('dotenv').config();

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const pass = process.env.DB_PASS || '';
const dbName = process.env.DB_NAME || 'FinalWeb';

const sequelize = new Sequelize(dbName, user, pass, {
  host,
  port,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    // adjust if needed
  }
});

const db = { sequelize };
db.User = require('./user')(sequelize);
db.Book = require('./book')(sequelize);
db.Category = require('./category')(sequelize);

// Define associations
db.Category.hasMany(db.Book, { foreignKey: 'categoryId', as: 'books' });
db.Book.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = db;
