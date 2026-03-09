const express       = require("express");
const LeaseModel    = require("../models/Lease");
const LeaseService  = require("../services/LeaseService");
const { authenticate, requireRole } = require("../middleware/auth");
const { validate, schemas }         = require("../middleware/validate");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();
router.use(authenticate);

// GET /api/leases — students see their own; others see all
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search } = req.query;

    let leases;
    if (req.user.role === "student") {
      leases = await LeaseModel.findByStudent(req.user.id);
    } else {
      leases = await LeaseModel.findAll({ status, search, limit, offset });
    }
    sendSuccess(res, leases);
  } catch (err) { next(err); }
});

// GET /api/leases/expiring — admin/inventory: leases expiring soon
router.get("/expiring", requireRole("admin", "inventory"), async (req, res, next) => {
  try {
    const days   = parseInt(req.query.days || 7, 10);
    const leases = await LeaseModel.findExpiring(days);
    sendSuccess(res, leases);
  } catch (err) { next(err); }
});

// GET /api/leases/:id
router.get("/:id", async (req, res, next) => {
  try {
    const lease = await LeaseModel.findById(req.params.id);
    if (!lease) throw new AppError("Lease not found.", 404);
    // Students can only view their own leases
    if (req.user.role === "student" && lease.student_id !== req.user.id)
      throw new AppError("Access denied.", 403);
    sendSuccess(res, lease);
  } catch (err) { next(err); }
});

// POST /api/leases — student applies for a lease
router.post("/", requireRole("student"), validate(schemas.createLease), async (req, res, next) => {
  try {
    const { deviceId, planType, durationWeeks } = req.body;
    const leaseId = await LeaseService.applyForLease({
      studentId: req.user.id,
      deviceId,
      planType,
      durationWeeks,
    });
    const lease = await LeaseModel.findById(leaseId);
    sendSuccess(res, lease, { message: "Lease application submitted successfully.", statusCode: 201 });
  } catch (err) { next(err); }
});

// PUT /api/leases/:id/status — admin updates status
router.put("/:id/status", requireRole("admin"), validate(schemas.updateLeaseStatus), async (req, res, next) => {
  try {
    const { status, rejectionNote } = req.body;
    const leaseId = parseInt(req.params.id, 10);

    if (status === "approved") {
      await LeaseService.approveLease(leaseId, req.user.id);
    } else if (status === "rejected") {
      await LeaseService.rejectLease(leaseId, req.user.id, rejectionNote);
    } else if (status === "returned") {
      await LeaseService.returnDevice(leaseId, req.user.id);
    } else {
      throw new AppError("Invalid status transition.", 400);
    }

    const updated = await LeaseModel.findById(leaseId);
    sendSuccess(res, updated, { message: `Lease ${status} successfully.` });
  } catch (err) { next(err); }
});

module.exports = router;
