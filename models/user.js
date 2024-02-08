const { Sequelize } = require("sequelize");
const { sequelize } = require("../utils/database");

const User = sequelize.define("User", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [1, 1024] },
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [1, 1024] },
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true, isEmail: true, len: [1, 1024] },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [1, 1024] },
  },
  account_created: { type: Sequelize.DATE, allowNull: false },
  account_updated: { type: Sequelize.DATE, allowNull: false },
});

module.exports = User;
