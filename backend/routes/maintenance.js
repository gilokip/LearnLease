const express             = require("express");
const MaintenanceLogModel = require("../models/MaintenanceLog");
const InventoryService    = require("../services/InventoryService");
const { authenticate, requireRole } = require("../middleware/auth");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();
router.use(authenticate);
router.use(requireRole("inventory", "admin"));

// GET /api/maintenance
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search } = req.query;
    const logs = await MaintenanceLogModel.findAll({ status, search, limit, offset });
    sendSuccess(res, logs);
  } catch (err) { next(err); }
});

// GET /api/maintenance/:id
router.get("/:id", async (req, res, next) => {
  try {
    const log = await MaintenanceLogModel.findById(req.params.id);
    if (!log) throw new AppError("Maintenance log not found.", 404);
    sendSuccess(res, log);
  } catch (err) { next(err); }
});

// PUT /api/maintenance/:id/resolve
router.put("/:id/resolve", async (req, res, next) => {
  try {
    const { resolution, cost } = req.body;
    await InventoryService.completeMaintenance(req.params.id, {
      resolution,
      cost,
      completedBy: req.user.id,
    });
    const log = await MaintenanceLogModel.findById(req.params.id);
    sendSuccess(res, log, { message: "Maintenance resolved." });
  } catch (err) { next(err); }
});

// PUT /api/maintenance/:id/status
router.put("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["reported", "in_progress", "resolved"].includes(status))
      throw new AppError("Invalid status.", 422);
    await MaintenanceLogModel.updateStatus(req.params.id, status);
    sendSuccess(res, null, { message: "Status updated." });
  } catch (err) { next(err); }
});

module.exports = router;
