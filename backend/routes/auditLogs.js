const express        = require("express");
const AuditLogModel  = require("../models/AuditLog");
const { authenticate, requireRole } = require("../middleware/auth");
const { sendSuccess, parsePagination } = require("../utils/response");

const router = express.Router();
router.use(authenticate);
router.use(requireRole("admin"));

// GET /api/audit-logs
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { userId, action, entityType } = req.query;
    const logs = await AuditLogModel.findAll({ userId, action, entityType, limit, offset });
    sendSuccess(res, logs);
  } catch (err) { next(err); }
});

module.exports = router;
