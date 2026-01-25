class ErrorHandler extends Error {
  constructor(statusCode, message, errName = "Error", errors = null) {
    super(message);
    this.name = errName; // Custom error name like "ValidationError", "AuthError", etc.
    this.statusCode = statusCode;
    this.errors = errors; // Store validation errors if provided
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
