const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) return res.sendStatus(err.statusCode);
  res.sendStatus(ApiError.badRequest().statusCode);
};

module.exports = errorHandler;
