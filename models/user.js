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
  verification_token: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
  },
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  token_expiration: {
    type: Sequelize.DATE,
    defaultValue: null,
    allowNull: true,
  },
  email_sent: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  email_sent_at: {
    type: Sequelize.DATE,
    defaultValue: null,
    allowNull: true,
  },
});

module.exports = User;
