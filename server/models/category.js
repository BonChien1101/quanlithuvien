const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'categories',
    timestamps: true
  });

  return Category;
};
