const { nodeEnv } = require("../config/constants");

/**
 * Lightweight HTTP request logger.
 * In production you would swap this for a library like morgan + winston.
 */
const requestLogger = (req, res, next) => {
  if (nodeEnv === "test") return next();

  const start = Date.now();

  res.on("finish", () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;
    const color  =
      status >= 500 ? "\x1b[31m" : // red
      status >= 400 ? "\x1b[33m" : // yellow
      status >= 300 ? "\x1b[36m" : // cyan
                      "\x1b[32m";  // green
    const reset = "\x1b[0m";

    console.log(
      `${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${status} — ${ms}ms${reset}`
    );
  });

  next();
};

module.exports = { requestLogger };
