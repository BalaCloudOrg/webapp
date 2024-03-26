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
      verificationUrl: `https://cloudnativewebapp.me:3000/v1/user/verify?username=${encodeURIComponent(
        createdUser.username
      )}&token=${encodeURIComponent(createdUser.verification_token)}`,
    };

    // Use this function to publish your message
    const topicName = "user-verification";

    publishMessage(topicName, pubSubMessage)
      .then(() => logger.info("Message published"))
      .catch((err) => logger.error("Error publishing message:", err));
    // Insert Pub/Sub publishing logic here. For now, we'll just log the message.
    // The actual Pub/Sub publishing code will be added here later.
    logger.debug("Prepared message for Pub/Sub:", pubSubMessage);
    console.log(pubSubMessage);

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

  if (!username || !token) {
    return res
      .status(400)
      .send({ message: "Missing username or token in request." });
  }

  try {
    // Fetch user details from the database based on the username
    const user = await User.findOne({
      where: { username: username },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    console.log("user details,", user);

    console.log("db token ", user.verification_token);
    console.log("query token", token);
    console.log(" result", user.verification_token === token);
    const currentTime = new Date();
    console.log(currentTime);
    console.log(user.token_expiration);
    console.log("result", currentTime < user.token_expiration);

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
      const user = await User.findOne({
        where: { username: username },
      });
      console.log(user.isVerified);
      return res.send({ message: "User verified successfully." });
    } else if (currentTime >= user.token_expiration) {
      return res
        .status(400)
        .send({ message: "Verification link has expired." });
    } else {
      return res.status(400).send({ message: "Invalid verification token." });
    }
  } catch (error) {
    console.error("Error during user verification:", error);
    return next(error); // Pass errors to the error-handling middleware
  }
});

router.all("/", (req, res, next) => {
  logger.warn("Method not allowed for the route.", { method: req.method }); // Warn about method not allowed
  next(ApiError.methodNotAllowed());
});

module.exports = router;
