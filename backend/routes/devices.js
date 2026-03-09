const express           = require("express");
const DeviceModel       = require("../models/Device");
const InventoryService  = require("../services/InventoryService");
const { authenticate, requireRole } = require("../middleware/auth");
const { validate, schemas }         = require("../middleware/validate");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();
router.use(authenticate);

// GET /api/devices — all authenticated users can browse
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search, campusLocation } = req.query;
    const devices = await DeviceModel.findAll({ status, search, campusLocation, limit, offset });
    sendSuccess(res, devices);
  } catch (err) { next(err); }
});

// GET /api/devices/summary — inventory/admin
router.get("/summary", requireRole("inventory", "admin"), async (req, res, next) => {
  try {
    const summary = await InventoryService.getInventorySummary();
    sendSuccess(res, summary);
  } catch (err) { next(err); }
});

// GET /api/devices/:id
router.get("/:id", async (req, res, next) => {
  try {
    const device = await DeviceModel.findById(req.params.id);
    if (!device) throw new AppError("Device not found.", 404);
    sendSuccess(res, device);
  } catch (err) { next(err); }
});

// POST /api/devices — inventory or admin
router.post("/", requireRole("inventory", "admin"), validate(schemas.createDevice), async (req, res, next) => {
  try {
    const deviceId = await InventoryService.addDevice(req.body, req.user.id);
    const device   = await DeviceModel.findById(deviceId);
    sendSuccess(res, device, { message: "Device added successfully.", statusCode: 201 });
  } catch (err) { next(err); }
});

// PUT /api/devices/:id — inventory or admin
router.put("/:id", requireRole("inventory", "admin"), async (req, res, next) => {
  try {
    await InventoryService.updateDevice(req.params.id, req.body, req.user.id);
    const device = await DeviceModel.findById(req.params.id);
    sendSuccess(res, device, { message: "Device updated." });
  } catch (err) { next(err); }
});

// POST /api/devices/:id/maintenance — flag for maintenance
router.post("/:id/maintenance", requireRole("inventory", "admin"), async (req, res, next) => {
  try {
    const { issue } = req.body;
    if (!issue) throw new AppError("'issue' description is required.", 422);
    const logId = await InventoryService.sendToMaintenance(req.params.id, {
      issue,
      reportedBy: req.user.id,
    });
    sendSuccess(res, { maintenanceLogId: logId }, { message: "Device sent to maintenance.", statusCode: 201 });
  } catch (err) { next(err); }
});

module.exports = router;
