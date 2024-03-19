const express = require("express");
const router = express.Router();

const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const {
  validatePutPayload,
  validatePayloadValues,
} = require("../utils/helper");
const logger = require("../utils/logging");

router.put("/", auth, async (req, res, next) => {
  logger.debug("PUT / - Received request", {
    body: req.body,
    username: req?.username,
  });

  if (
    !req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length > 0 ||
    Object.keys(req.body) == 0 ||
    !validatePutPayload(req.body)
  ) {
    logger.warn("PUT / - Bad request", {
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body,
    });
    return next(ApiError.badRequest());
  }

  if (validatePayloadValues(req.body)) {
    logger.warn("PUT / - Payload values validation failed", { body: req.body });
    return next(ApiError.badRequest());
  }

  try {
    Object.keys(req.body).forEach(async (element) => {
      const isPassword = element === "password";
      let hashedPass;
      if (isPassword) {
        logger.debug(`Hashing password for user ${req?.username}`);
        hashedPass = await bcrypt.hash(req?.body[element], 10);
      }
      try {
        await User.update(
          { [element]: isPassword ? hashedPass : req?.body[element] },
          { where: { username: req?.username } }
        );
      } catch (error) {
        logger.error("PUT / - Error updating user", {
          error: error,
          username: req?.username,
        });
        return next(ApiError.badRequest());
      }
    });
    await User.update(
      { account_updated: new Date().toISOString() },
      { where: { username: req?.username } }
    );
    logger.info("PUT / - User updated successfully", {
      username: req?.username,
    });
    return res.status(204).end();
  } catch (error) {
    logger.error("PUT / - Unexpected error updating user", {
      error: error,
      username: req?.username,
    });
    return next(ApiError.badRequest());
  }
});

router.get("/", auth, async (req, res, next) => {
  logger.debug("GET / - Received request", { username: req?.username });

  if (req.method === "HEAD") {
    logger.warn("GET / - Method not allowed HEAD");
    return next(ApiError.methodNotAllowed());
  }

  if (
    !req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length > 0 ||
    JSON.stringify(req.body) !== JSON.stringify({})
  ) {
    logger.warn("GET / - Bad request", {
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body,
    });
    return next(ApiError.badRequest());
  }

  let userDetails;
  try {
    const user = await User.findAll({
      where: { username: req?.username },
    });
    if (user.length == 0) {
      logger.warn("GET / - User not found", { username: req?.username });
      throw new Error("User not found");
    }
    userDetails = user[0].dataValues;
    logger.info("GET / - User details retrieved successfully", {
      userDetails: userDetails,
    });
  } catch (error) {
    logger.error("GET / - Error retrieving user details", {
      error: error,
      username: req?.username,
    });
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

router.all("/", (req, res, next) => {
  logger.warn("Method not allowed", { method: req.method });
  next(ApiError.methodNotAllowed());
});

module.exports = router;
