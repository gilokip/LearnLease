const express      = require("express");
const UserModel    = require("../models/User");
const AuthService  = require("../services/AuthService");
const { authenticate, requireRole, requireOwnerOrAdmin } = require("../middleware/auth");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();
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

// ── Staff management (admin only) ────────────────────────────────────────────

// GET /api/users/staff — list all non-student accounts
router.get("/staff", requireRole("admin"), async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { search } = req.query;

    // Fetch admin, inventory, finance accounts
    const [admins, inventory, finance] = await Promise.all([
      UserModel.findAll({ role: "admin",     search, limit, offset }),
      UserModel.findAll({ role: "inventory", search, limit, offset }),
      UserModel.findAll({ role: "finance",   search, limit, offset }),
    ]);

    // Merge and sort by created_at desc
    const staff = [...admins, ...inventory, ...finance]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sendSuccess(res, staff);
  } catch (err) { next(err); }
});

// POST /api/users/staff — admin creates a staff account
router.post("/staff", requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError("name, email, password and role are all required.", 422);
    }
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 422);
    }

    const user = await AuthService.createStaff({ name, email, password, role });
    sendSuccess(res, user, { message: `${role} account created successfully.`, statusCode: 201 });
  } catch (err) { next(err); }
});

// ── Individual user routes ────────────────────────────────────────────────────

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
    // Prevent admin from deactivating themselves
    if (Number(req.params.id) === req.user.id) {
      throw new AppError("You cannot deactivate your own account.", 400);
    }
    await UserModel.deactivate(req.params.id);
    sendSuccess(res, null, { message: "User deactivated." });
  } catch (err) { next(err); }
});

// PUT /api/users/:id/reactivate — admin only
router.put("/:id/reactivate", requireRole("admin"), async (req, res, next) => {
  try {
    await UserModel.update(req.params.id, { is_active: 1 });
    sendSuccess(res, null, { message: "User reactivated." });
  } catch (err) { next(err); }
});

module.exports = router;