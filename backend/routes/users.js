const express    = require("express");
const UserModel  = require("../models/User");
const { authenticate, requireRole, requireOwnerOrAdmin } = require("../middleware/auth");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users — admin only: list all users
router.get("/", requireRole("admin"), async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { role, search }        = req.query;
    const users = await UserModel.findAll({ role, search, limit, offset });
    sendSuccess(res, users);
  } catch (err) { next(err); }
});

// GET /api/users/stats — admin: count by role
router.get("/stats", requireRole("admin"), async (req, res, next) => {
  try {
    const stats = await UserModel.countByRole();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
});

// GET /api/users/:id — owner or admin
router.get("/:id", requireOwnerOrAdmin("id"), async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw new AppError("User not found.", 404);
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

// PUT /api/users/:id — owner or admin: update profile
router.put("/:id", requireOwnerOrAdmin("id"), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    await UserModel.update(req.params.id, { name, email });
    const updated = await UserModel.findById(req.params.id);
    sendSuccess(res, updated, { message: "Profile updated." });
  } catch (err) { next(err); }
});

// DELETE /api/users/:id — admin only: deactivate
router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    await UserModel.deactivate(req.params.id);
    sendSuccess(res, null, { message: "User deactivated." });
  } catch (err) { next(err); }
});

module.exports = router;
