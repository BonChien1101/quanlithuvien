const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reader = sequelize.define('Reader', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
  // Liên kết tới bảng users
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  contact: { type: DataTypes.STRING(200), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true, validate: { len: [0, 20] } },
  email: { type: DataTypes.STRING(200), allowNull: true, validate: { isEmail: true } },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  address: { type: DataTypes.STRING(300), allowNull: true },
  note: { type: DataTypes.TEXT, allowNull: true },
  quota: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3 },
  // Số lượng tối đa có thể mượn
  maxQuota: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3 },
  }, {
    tableName: 'readers',
    timestamps: true,
  });

  return Reader;
};
