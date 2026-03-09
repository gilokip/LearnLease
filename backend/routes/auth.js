const express     = require("express");
const AuthService = require("../services/AuthService");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { sendSuccess }  = require("../utils/response");

const router = express.Router();

// POST /api/auth/register
router.post("/register", validate(schemas.register), async (req, res, next) => {
  try {
    const { email, password, name, role, studentId } = req.body;
    const result = await AuthService.register({ email, password, name, role, studentId });
    sendSuccess(res, result, { message: "Registration successful.", statusCode: 201 });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post("/login", validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    sendSuccess(res, result, { message: "Login successful." });
  } catch (err) { next(err); }
});

// POST /api/auth/change-password  (requires auth)
router.post("/change-password", authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(422).json({ status: "error", message: "Both currentPassword and newPassword are required." });
    await AuthService.changePassword(req.user.id, { currentPassword, newPassword });
    sendSuccess(res, null, { message: "Password updated successfully." });
  } catch (err) { next(err); }
});

// GET /api/auth/me  (requires auth)
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const UserModel = require("../models/User");
    const user = await UserModel.findById(req.user.id);
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

module.exports = router;
