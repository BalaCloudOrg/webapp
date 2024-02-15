const ApiError = require("../utils/ApiError");

const addResHeader = (req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  next();
};

const pageNotFound = (req, res, next) => next(ApiError.pageNotFound());

module.exports = { addResHeader, pageNotFound };
