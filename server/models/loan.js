const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    bookId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    readerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    borrowedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    dueAt: { type: DataTypes.DATE, allowNull: true },
    returnedAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'loans',
    timestamps: true,
  });

  return Loan;
};
