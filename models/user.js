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
  first_name: { type: Sequelize.STRING, allowNull: false },
  last_name: { type: Sequelize.STRING, allowNull: false },
  username: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false },
  account_created: { type: Sequelize.DATE, allowNull: false },
  account_updated: { type: Sequelize.DATE, allowNull: false },
});

module.exports = User;
