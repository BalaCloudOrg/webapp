const express = require("express");
const logger = require("../utils/logging");
const router = express.Router();

const ApiError = require("../utils/ApiError");
const { connectToDb } = require("../utils/database");

router.get("/", (req, res, next) => {
  logger.info("Reached GET route handler for healthz endpoint");
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

router.all("/", (req, res, next) => next(ApiError.methodNotAllowed()));

module.exports = router;
