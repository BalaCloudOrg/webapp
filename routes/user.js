const express = require("express");
const router = express.Router();

const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const {
  validatePostPayload,
  validatePayloadValues,
} = require("../utils/helper");
const logger = require("../utils/logging");

router.post("/", async (req, res, next) => {
  logger.debug("Received a request to create a user.", { body: req.body });

  if (
    req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length > 0 ||
    Object.keys(req.body) == 0 ||
    !validatePostPayload(req.body)
  ) {
    logger.warn(
      "Bad request in user creation: Unauthorized headers or bad payload."
    );
    return next(ApiError.badRequest());
  }

  if (validatePayloadValues(req.body)) {
    logger.warn("User creation payload validation failed.");
    return next(ApiError.badRequest());
  }

  let createdUser;
  try {
    const hashedPass = await bcrypt.hash(req.body?.password, 10);

    logger.info("Password hashing successful, proceeding to create user.");

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

    logger.info("User created successfully.", { username: req.body.username });
  } catch (error) {
    logger.error("Error in user creation process.", { error: error });
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

router.all("/", (req, res, next) => {
  logger.warn("Method not allowed for the route.", { method: req.method }); // Warn about method not allowed
  next(ApiError.methodNotAllowed());
});

module.exports = router;
