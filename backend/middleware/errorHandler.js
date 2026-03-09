const { nodeEnv }  = require("../config/constants");
const { AppError } = require("../utils/errors");

/**
 * 404 handler — attach after all routes.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Global error handler — must be the last middleware.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message    = "A record with that value already exists.";
  }

  // MySQL FK constraint
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message    = "Referenced record does not exist.";
  }

  // JWT errors (should already be caught in middleware, but just in case)
  if (err.name === "JsonWebTokenError") { statusCode = 401; message = "Invalid token."; }
  if (err.name === "TokenExpiredError") { statusCode = 401; message = "Token expired."; }

  const response = {
    status:  "error",
    message,
    ...(nodeEnv === "development" && { stack: err.stack }),
  };

  if (nodeEnv !== "test") {
    console.error(`[${new Date().toISOString()}] ${statusCode} — ${message}`);
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
