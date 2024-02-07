const mysql = require("mysql2");
const ApiError = require("./ApiError");
const { Sequelize } = require("sequelize");

const connectToDb = async (res, next) => {
  const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    { host: process.env.MYSQL_HOST, dialect: "mysql" }
  );

  try {
    await sequelize.authenticate();
    console.log("connection exists");
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return next(ApiError.serviceUnavailable());
  } finally {
    sequelize.close();
  }
};

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  { host: process.env.MYSQL_HOST, dialect: "mysql" }
);

module.exports = { connectToDb, sequelize };
