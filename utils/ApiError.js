class ApiError {
  constructor(statusCode) {
    this.statusCode = statusCode;
  }

  static badRequest() {
    return new ApiError(400);
  }

  static unAuthorized() {
    return new ApiError(401);
  }

  static pageNotFound() {
    return new ApiError(404);
  }

  static methodNotAllowed() {
    return new ApiError(405);
  }

  static serviceUnavailable() {
    return new ApiError(503);
  }
}

module.exports = ApiError;
