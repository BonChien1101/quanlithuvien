const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(200), allowNull: false },
    roles: { type: DataTypes.TEXT, allowNull: true, // JSON string of roles
      get() {
        const raw = this.getDataValue('roles');
        try { return JSON.parse(raw || '[]'); } catch { return []; }
      },
      set(val) { this.setDataValue('roles', JSON.stringify(val || [])); }
    }
  }, {
    tableName: 'users',
    timestamps: true,
  });

  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
