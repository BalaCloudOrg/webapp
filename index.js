const express = require("express");
const { Sequelize } = require("sequelize");

const app = express();

const { connectToDb, sequelize } = require("./utils/database");
const errorHandler = require("./middlewares/errorHandler");
const User = require("./models/user");
const logger = require("./utils/logging");

require("./routes/index")(app);

(async () => {
  logger.debug("Attempting to connect to the database...");
  try {
    await sequelize.authenticate();
    logger.info("Connection to database has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
})();

User.sync()
  .then((res) => {
    logger.info("Table synced", { response: res });
  })
  .catch((err) => logger.error("error on table creation", err));

app.use(errorHandler);

const port = process.env.PORT;
var server = app.listen(port, () => {
  logger.info(`listening on port:${port}`);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err });
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", { error: err });
});

module.exports = server;
