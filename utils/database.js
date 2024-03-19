const mysql = require("mysql2");
const ApiError = require("./ApiError");
const { Sequelize } = require("sequelize");
const logger = require("./logging");

const connectToDb = async (res, next) => {
  const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    { host: process.env.MYSQL_HOST, dialect: "mysql" }
  );

  logger.debug("Attempting to establish database connection...", {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
  });

  try {
    await sequelize.authenticate();
    logger.info("Database connection successfully established.");
    return res.status(200).end();
  } catch (error) {
    logger.error("Database connection failed", error);
    return next(ApiError.serviceUnavailable());
  } finally {
    logger.debug("Closing database connection...");
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
