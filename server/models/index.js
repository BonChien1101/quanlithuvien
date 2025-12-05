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
db.Reader = require('./reader')(sequelize);
db.Loan = require('./loan')(sequelize);

// Define associations
db.Category.hasMany(db.Book, { foreignKey: 'categoryId', as: 'books' });
db.Book.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

// User-Reader association
db.User.hasOne(db.Reader, { foreignKey: 'userId', as: 'reader' });
db.Reader.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Reader associations
db.Reader.hasMany(db.Loan, { foreignKey: 'readerId', as: 'loans' });
db.Loan.belongsTo(db.Reader, { foreignKey: 'readerId', as: 'reader' });

// Book associations
db.Book.hasMany(db.Loan, { foreignKey: 'bookId', as: 'loans' });
db.Loan.belongsTo(db.Book, { foreignKey: 'bookId', as: 'book' });

module.exports = db;
