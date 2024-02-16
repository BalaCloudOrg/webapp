const express = require("express");

const healthCheck = require("../routes/healthCheck");
const user = require("../routes/user");
const authUser = require("../routes/authUser");
const { addResHeader, pageNotFound } = require("../middlewares/utils");

module.exports = (app) => {
  app.use(addResHeader);

  app.use(express.json());

  app.use("/healthz", healthCheck);

  app.use("/v1/user", user);

  app.use("/v1/user/self", authUser);

  app.use("*", pageNotFound);
};
