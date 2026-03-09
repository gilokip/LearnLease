const PaymentModel  = require("../models/Payment");
const LeaseModel    = require("../models/Lease");
const AuditLogModel = require("../models/AuditLog");
const { AppError }  = require("../utils/errors");
const { toMysqlDate } = require("../utils/dates");

class PaymentService {
  /**
   * Record a payment as paid.
   */
  static async recordPayment(paymentId, { paidDate, paymentRef, recordedBy }) {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new AppError("Payment record not found.", 404);
    if (payment.status === "paid") throw new AppError("Payment has already been marked as paid.", 400);

    await PaymentModel.markPaid(paymentId, {
      paidDate:   paidDate ? toMysqlDate(new Date(paidDate)) : toMysqlDate(),
      paymentRef: paymentRef || null,
    });

    await AuditLogModel.log({
      userId:     recordedBy,
      action:     "PAYMENT_RECORDED",
      entityType: "payment",
      entityId:   paymentId,
      details:    { amount: payment.amount, leaseId: payment.lease_id },
    });
  }

  /**
   * Run overdue sweep — call this via a cron job daily.
   * Returns the number of records updated.
   */
  static async sweepOverdue() {
    const count = await PaymentModel.markOverdue();
    console.log(`[PaymentService] Overdue sweep: ${count} payment(s) marked overdue.`);
    return count;
  }

  /**
   * Get the finance dashboard summary.
   */
  static async getSummary() {
    return PaymentModel.getSummary();
  }

  /**
   * Get all payments (finance/admin view).
   */
  static async getAllPayments({ status, search, page, limit, offset }) {
    return PaymentModel.findAll({ status, search, limit, offset });
  }

  /**
   * Get payments for a specific student.
   */
  static async getStudentPayments(studentId) {
    return PaymentModel.findByStudent(studentId);
  }
}

module.exports = PaymentService;
