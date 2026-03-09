const jwt                        = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/constants");

/**
 * Sign a JWT with the standard user payload.
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

/**
 * Verify a JWT and return the decoded payload.
 * Throws if the token is invalid or expired.
 */
const verifyToken = (token) => jwt.verify(token, jwtSecret);

module.exports = { signToken, verifyToken };
