const bcrypt        = require("bcrypt");
const UserModel     = require("../models/User");
const { signToken } = require("../utils/jwt");
const { AppError }  = require("../utils/errors");
const { bcryptRounds, validRoles } = require("../config/constants");

class AuthService {
  /**
   * Register a new user.
   * Returns { token, user }.
   */
  static async register({ email, password, name, role, studentId }) {
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(", ")}.`, 400);
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) throw new AppError("An account with that email already exists.", 409);

    const passwordHash = await bcrypt.hash(password, bcryptRounds);

    const userId = await UserModel.create({ email, passwordHash, name, role, studentId });
    const user   = await UserModel.findById(userId);

    return { user };
  }

  /**
   * Authenticate a user by email and password.
   * Returns { token, user }.
   */
  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new AppError("Invalid email or password.", 401);
    if (!user.is_active) throw new AppError("Your account has been deactivated. Contact admin.", 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new AppError("Invalid email or password.", 401);

    const token = signToken(user);

    return {
      token,
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        studentId: user.student_id,
      },
    };
  }

  /**
   * Change a user's password after verifying the current password.
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await UserModel.findByEmail(
      (await UserModel.findById(userId))?.email
    );
    if (!user) throw new AppError("User not found.", 404);

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) throw new AppError("Current password is incorrect.", 401);

    const hash = await bcrypt.hash(newPassword, bcryptRounds);
    await UserModel.updatePassword(userId, hash);
  }
}

module.exports = AuthService;
