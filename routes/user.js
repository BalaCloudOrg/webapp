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

router.post("/", async (req, res, next) => {
  if (
    req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length > 0 ||
    Object.keys(req.body) == 0 ||
    !validatePostPayload(req.body)
  )
    return next(ApiError.badRequest());

  if (validatePayloadValues(req.body)) return next(ApiError.badRequest());

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

router.all("/", (req, res, next) => next(ApiError.methodNotAllowed()));

module.exports = router;
