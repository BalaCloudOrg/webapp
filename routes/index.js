const express = require("express");

const bcrypt = require("bcrypt");

const ApiError = require("../utils/ApiError");
const { connectToDb, sequelize } = require("../utils/database");
const auth = require("../middlewares/auth");
const { validatePostPayload, validatePutPayload } = require("../utils/helper");
const User = require("../models/user");
const healthCheck = require("../routes/healthCheck");
const user = require("../routes/user");
const authUser = require("../routes/authUser");
const { addResHeader, pageNotFound } = require("../middlewares/utils");
const logger = require("../utils/logging");

module.exports = (app) => {
  logger.debug("Setting up middlewares and routes");

  app.use(addResHeader);

  app.use(express.json());

  app.use("/healthz", healthCheck);

  app.use("/v8/user", user);

  app.use("/v8/user/self", authUser);

  app.use("*", pageNotFound);
};
