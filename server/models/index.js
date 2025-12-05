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
  // điều chỉnh nếu cần thiết
  }
});

const db = { sequelize };
db.User = require('./user')(sequelize);
db.Book = require('./book')(sequelize);
db.Category = require('./category')(sequelize);
db.Reader = require('./reader')(sequelize);
db.Loan = require('./loan')(sequelize);

// Định nghĩa các mối quan hệ
db.Category.hasMany(db.Book, { foreignKey: 'categoryId', as: 'books' });
db.Book.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

// Quan hệ của Reader
db.Reader.hasMany(db.Loan, { foreignKey: 'readerId', as: 'loans' });
db.Loan.belongsTo(db.Reader, { foreignKey: 'readerId', as: 'reader' });

// Liên kết Reader với User để xác định quyền sở hữu
db.User.hasOne(db.Reader, { foreignKey: 'userId', as: 'reader' });
db.Reader.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Quan hệ của Book
db.Book.hasMany(db.Loan, { foreignKey: 'bookId', as: 'loans' });
db.Loan.belongsTo(db.Book, { foreignKey: 'bookId', as: 'book' });

module.exports = db;
