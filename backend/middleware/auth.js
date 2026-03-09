const jwt              = require("jsonwebtoken");
const { jwtSecret }    = require("../config/constants");
const UserModel        = require("../models/User");
const { AppError }     = require("../utils/errors");

/**
 * Verify JWT token and attach decoded payload to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Authentication required. No token provided.", 401);
    }

    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Optional: re-fetch user to ensure account is still active
    const user = await UserModel.findById(decoded.id);
    if (!user)        throw new AppError("User account not found.",       401);
    if (!user.is_active) throw new AppError("Account has been deactivated.", 403);

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    // JWT errors
    if (err.name === "JsonWebTokenError")  return next(new AppError("Invalid token.",         401));
    if (err.name === "TokenExpiredError")  return next(new AppError("Token has expired.",      401));
    next(err);
  }
};

/**
 * Role-based access control.
 * Usage: requireRole("admin", "finance")
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError("Not authenticated.", 401));
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. Requires one of: ${roles.join(", ")}. Your role: ${req.user.role}.`,
        403
      )
    );
  }
  next();
};

/**
 * Allow access only to the resource owner OR admin.
 * Usage: requireOwnerOrAdmin("studentId") — matches req.params.studentId
 */
const requireOwnerOrAdmin = (paramKey = "id") => (req, res, next) => {
  if (!req.user) return next(new AppError("Not authenticated.", 401));
  const resourceOwnerId = parseInt(req.params[paramKey], 10);
  if (req.user.role === "admin" || req.user.id === resourceOwnerId) return next();
  next(new AppError("You do not have permission to access this resource.", 403));
};

module.exports = { authenticate, requireRole, requireOwnerOrAdmin };
