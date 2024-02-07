const express = require("express");
const { Sequelize } = require("sequelize");

const app = express();

const { connectToDb, sequelize } = require("./utils/database");
const errorHandler = require("./middlewares/errorHandler");
const User = require("./models/user");

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
    console.log("after db", res);
  })
  .catch((err) => console.log("error on db creation", err));
app.use(errorHandler);

const port = process.env.PORT;
var server = app.listen(port, () => {
  console.log(`listening on port:${port}`);
  // connectToDb();
});

module.exports = server;
