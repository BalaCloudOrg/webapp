const express = require("express");
const logger = require("../utils/logging");
const router = express.Router();

const ApiError = require("../utils/ApiError");
const { connectToDb } = require("../utils/database");

router.get("/", (req, res, next) => {
  logger.debug("Received a GET request to /");

  if (req.method === "HEAD") {
    logger.warn("Method HEAD is not allowed");
    return next(ApiError.methodNotAllowed());
  }

  if (
    req.headers.authorization ||
    Object.keys(req.params).length > 0 ||
    Object.keys(req.query).length > 0 ||
    JSON.stringify(req.body) !== JSON.stringify({})
  ) {
    logger.warn("Bad request to the path", {
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body,
    });
    return next(ApiError.badRequest());
  }

  logger.info("Connecting to the database in response to a GET request to /");
  connectToDb(res, next);
});

router.all("/", (req, res, next) => {
  logger.warn(`Received a non-GET request (${req.method}) to /`, {
    method: req.method,
  });
  next(ApiError.methodNotAllowed());
});

module.exports = router;
