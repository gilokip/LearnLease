const express        = require("express");
const PaymentService = require("../services/PaymentService");
const { authenticate, requireRole } = require("../middleware/auth");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();
router.use(authenticate);

// GET /api/payments — student: own; finance/admin: all
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search } = req.query;

    let payments;
    if (req.user.role === "student") {
      payments = await PaymentService.getStudentPayments(req.user.id);
    } else {
      payments = await PaymentService.getAllPayments({ status, search, page, limit, offset });
    }
    sendSuccess(res, payments);
  } catch (err) { next(err); }
});

// GET /api/payments/summary — finance/admin
router.get("/summary", requireRole("finance", "admin"), async (req, res, next) => {
  try {
    const summary = await PaymentService.getSummary();
    sendSuccess(res, summary);
  } catch (err) { next(err); }
});

// POST /api/payments/:id/pay — finance/admin records payment
router.post("/:id/pay", requireRole("finance", "admin"), async (req, res, next) => {
  try {
    const { paidDate, paymentRef } = req.body;
    await PaymentService.recordPayment(req.params.id, {
      paidDate,
      paymentRef,
      recordedBy: req.user.id,
    });
    sendSuccess(res, null, { message: "Payment recorded successfully." });
  } catch (err) { next(err); }
});

// POST /api/payments/sweep-overdue — finance/admin triggers overdue sweep
router.post("/sweep-overdue", requireRole("finance", "admin"), async (req, res, next) => {
  try {
    const count = await PaymentService.sweepOverdue();
    sendSuccess(res, { updatedCount: count }, { message: `${count} payment(s) marked overdue.` });
  } catch (err) { next(err); }
});

module.exports = router;
