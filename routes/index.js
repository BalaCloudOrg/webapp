const express = require("express");

const bcrypt = require("bcrypt");

const ApiError = require("../utils/ApiError");
const { connectToDb, sequelize } = require("../utils/database");
const auth = require("../middlewares/auth");
const {
  validatePostPayload,
  validatePutRequestBody,
} = require("../utils/helper");
const User = require("../models/user");
const { where } = require("sequelize");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
  });

  app.use(express.json());

  app.get("/healthz", (req, res, next) => {
    if (req.method === "HEAD") return next(ApiError.methodNotAllowed());

    if (
      req.headers.authorization ||
      Object.keys(req.params).length > 0 ||
      Object.keys(req.query).length > 0 ||
      JSON.stringify(req.body) !== JSON.stringify({})
    )
      return next(ApiError.badRequest());

    connectToDb(res, next);
  });

  app.post("/v1/user", async (req, res, next) => {
    if (
      req.headers.authorization ||
      Object.keys(req.params).length > 0 ||
      Object.keys(req.query).length > 0 ||
      Object.keys(req.body) == 0 ||
      !validatePostPayload(req.body)
    )
      return next(ApiError.badRequest());

    let createdUser;
    try {
      const hashedPass = await bcrypt.hash(req.body?.password, 10);

      await User.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hashedPass,
        account_created: new Date().toISOString(),
        account_updated: new Date().toISOString(),
      });

      const allUsers = await User.findAll({
        where: { username: req.body.username },
      });
      createdUser = allUsers[0]?.dataValues;
    } catch (error) {
      console.log(error);
      return next(ApiError.badRequest());
    }

    return res.status(201).send({
      id: createdUser.id,
      first_name: createdUser.first_name,
      last_name: createdUser.last_name,
      username: createdUser.username,
      account_created: createdUser.account_created,
      account_updated: createdUser.account_updated,
    });
  });

  app.put("/v1/user/self", auth, async (req, res, next) => {
    if (
      !req.headers.authorization ||
      Object.keys(req.params).length > 0 ||
      Object.keys(req.query).length > 0 ||
      Object.keys(req.body) == 0 ||
      !validatePutRequestBody(req.body)
    )
      return next(ApiError.badRequest());

    try {
      Object.keys(req.body).forEach(async (element) => {
        const isPassword = element === "password";
        let hashedPass;
        if (isPassword) hashedPass = await bcrypt.hash(req?.body[element], 10);
        try {
          await User.update(
            { [element]: isPassword ? hashedPass : req?.body[element] },
            { where: { username: req?.username } }
          );
        } catch (error) {
          console.log(error);
          // return next(ApiError.badRequest());
        }
      });
      await User.update(
        { account_updated: new Date().toISOString() },
        { where: { username: req?.username } }
      );
      return res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return next(ApiError.badRequest());
    }
  });

  app.get("/v1/user/self", auth, async (req, res, next) => {
    if (req.method === "HEAD") return next(ApiError.methodNotAllowed());

    if (
      !req.headers.authorization ||
      Object.keys(req.params).length > 0 ||
      Object.keys(req.query).length > 0 ||
      JSON.stringify(req.body) !== JSON.stringify({})
    )
      return next(ApiError.badRequest());

    let userDetails;
    try {
      const user = await User.findAll({
        where: { username: req?.username },
      });
      if (user.length == 0) throw new Error("User not found");
      userDetails = user[0].dataValues;
    } catch (error) {
      console.log(error);
      return next(ApiError.badRequest());
    }

    return res.status(200).send({
      id: userDetails.id,
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      username: userDetails.username,
      account_created: userDetails.account_created,
      account_updated: userDetails.account_updated,
    });
  });

  app.use("/", (req, res, next) => {
    if (req.method != "GET" && req.method != "PUT" && req.method != "POST")
      return next(ApiError.methodNotAllowed());
    next(ApiError.pageNotFound());
  });
};
