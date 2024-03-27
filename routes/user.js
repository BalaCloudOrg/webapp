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
const publishMessage = require("../utils/pubSub");

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

    const pubSubMessage = {
      username: createdUser.username,
      verificationToken: createdUser.verification_token,
      verificationUrl: `http://cloudnativewebapp.me:3000/v1/user/verify?username=${encodeURIComponent(
        createdUser.username
      )}&token=${encodeURIComponent(createdUser.verification_token)}`,
    };

    const topicName = "verify_email";

    logger.debug("Prepared message for Pub/Sub:", pubSubMessage);
    // Use this function to publish your message
    publishMessage(topicName, pubSubMessage)
      .then(() => logger.info("Message published"))
      .catch((err) => logger.error("Error publishing message:", err));

    return res.status(201).send({
      id: createdUser.id,
      first_name: createdUser.first_name,
      last_name: createdUser.last_name,
      username: createdUser.username,
      account_created: createdUser.account_created,
      account_updated: createdUser.account_updated,
    });
  } catch (error) {
    logger.error("Error in user creation process.", { error: error });
    return next(ApiError.badRequest());
  }
});

router.get("/verify", async (req, res, next) => {
  const { username, token } = req.query;

  if (
    req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length !== 2 ||
    Object.keys(req.body).length > 0 ||
    !req.query.username ||
    !req.query.token
  ) {
    logger.error("Bad request for user verification process.");
    return next(ApiError.badRequest());
  }

  try {
    const user = await User.findOne({
      where: { username: username },
    });

    if (!user) {
      logger.error("No user found");
      return next(ApiError.badRequest());
    }

    const currentTime = new Date();
    // Check if the token matches and the current timestamp is less than the expiration time
    if (
      user.verification_token === token &&
      currentTime < user.token_expiration
    ) {
      // Update user detail in the database as verified
      await User.update(
        { isVerified: true },
        {
          where: { username: username },
        }
      );
      logger.debug("User updated as verified");
      return res.status(200).end();
    } else if (currentTime >= user.token_expiration) {
      logger.error("Verification link has expired");
      return next(ApiError.badRequest());
    } else {
      logger.error("Invalid verification token");
      return next(ApiError.badRequest());
    }
  } catch (error) {
    logger.error("Error during user verification:", error);
    return next(ApiError.badRequest());
  }
});

router.all("/verify", (req, res, next) => {
  logger.warn("Method not allowed for the route.", { method: req.method });
  next(ApiError.methodNotAllowed());
});

router.all("/", (req, res, next) => {
  logger.warn("Method not allowed for the route.", { method: req.method });
  next(ApiError.methodNotAllowed());
});

module.exports = router;
