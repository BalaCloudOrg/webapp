const bcrypt = require("bcrypt");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");

const auth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  const authToken = req.headers.authorization;
  const encrypted = authToken.split(" ")[1];
  const decrypted = atob(encrypted);
  const fields = decrypted.split(":");
  const username = fields[0];
  const password = fields[1];
  let isAuthorized;

  const user = await User.findAll({
    attributes: ["password"],
    where: { username: username },
  });
  if (user.length == 0) isAuthorized = false;
  else {
    try {
      const hashedPass = user[0]?.dataValues.password;
      isAuthorized = await bcrypt.compare(password, hashedPass);
    } catch (error) {
      console.log(error);
      isAuthorized = false;
    }
  }
  if (!isAuthorized) next(ApiError.unAuthorized());

  req.username = username;
  next();
};

module.exports = auth;
