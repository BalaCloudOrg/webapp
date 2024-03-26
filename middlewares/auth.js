const bcrypt = require("bcrypt");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logging");

const auth = async (req, res, next) => {
  if (!req.headers.authorization) {
    logger.warn("No authorization header present in the request.");
    return next();
  }
  const authToken = req.headers.authorization;
  const encrypted = authToken.split(" ")[1];
  const decrypted = atob(encrypted);
  const fields = decrypted.split(":");
  const username = fields[0];
  const password = fields[1];
  let isAuthorized;

  logger.debug(`Attempting to authenticate user: ${username}`);

  const user = await User.findAll({
    attributes: ["password", "isVerified"],
    where: { username: username },
  });
  if (user.length == 0) {
    logger.info(`No user found with username: ${username}`);
    isAuthorized = false;
  } else {
    try {
      const isVerified = user[0]?.dataValues.isVerified;
      console.log("from auth", isVerified);
      const hashedPass = user[0]?.dataValues.password;
      const doesPasswordMatch = await bcrypt.compare(password, hashedPass);
      isAuthorized = isVerified && doesPasswordMatch;
    } catch (error) {
      logger.error(
        `Error during authentication process for user ${username}: ${error.message}`
      );
      isAuthorized = false;
    }
  }
  if (!isAuthorized) next(ApiError.unAuthorized());

  req.username = username;
  next();
};

module.exports = auth;
