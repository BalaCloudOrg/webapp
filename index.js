const express = require("express");
const { Sequelize } = require("sequelize");

const app = express();

const { connectToDb, sequelize } = require("./utils/database");
const errorHandler = require("./middlewares/errorHandler");
const User = require("./models/user");
const logger = require("./utils/logging");

require("./routes/index")(app);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

User.sync()
  .then((res) => {
    console.log("Table synced", res);
  })
  .catch((err) => console.log("error on table creation", err));
app.use(errorHandler);

const port = process.env.PORT;
var server = app.listen(port, () => {
  console.log(`listening on port:${port}`);
  logger.info(`listening on port:${port}`);
});

process.on("uncaughtException", (err) => {
  logger.error(err);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason);
});

module.exports = server;
