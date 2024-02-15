const express = require("express");
const router = express.Router();

const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const {
  validatePutPayload,
  validatePutRequestValues,
} = require("../utils/helper");

router.put("/", auth, async (req, res, next) => {
  if (
    !req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length > 0 ||
    Object.keys(req.body) == 0 ||
    !validatePutPayload(req.body)
  )
    return next(ApiError.badRequest());

  if (validatePayloadValues(req.body)) return next(ApiError.badRequest());

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
        return next(ApiError.badRequest());
      }
    });
    await User.update(
      { account_updated: new Date().toISOString() },
      { where: { username: req?.username } }
    );
    return res.status(204).end();
  } catch (error) {
    console.log(error);
    return next(ApiError.badRequest());
  }
});

router.get("/", auth, async (req, res, next) => {
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

router.all("/", (req, res, next) => next(ApiError.methodNotAllowed()));

module.exports = router;
