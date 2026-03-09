const LeaseModel    = require("../models/Lease");
const DeviceModel   = require("../models/Device");
const PaymentModel  = require("../models/Payment");
const AuditLogModel = require("../models/AuditLog");
const { AppError }  = require("../utils/errors");
const { addWeeks, toMysqlDate, generateMonthlyDates } = require("../utils/dates");
const { leaseStatus, deviceStatus } = require("../config/constants");

const PLAN_WEEKS = { semester: 16, annual: 48, monthly: 4 };

class LeaseService {
  /**
   * Student submits a new lease application.
   */
  static async applyForLease({ studentId, deviceId, planType, durationWeeks }) {
    // Block duplicate active/pending leases
    const existing = await LeaseModel.findActiveByStudent(studentId);
    if (existing) throw new AppError("You already have an active or pending lease.", 409);

    // Confirm device is available
    const device = await DeviceModel.findById(deviceId);
    if (!device) throw new AppError("Device not found.", 404);
    if (device.status !== deviceStatus.AVAILABLE)
      throw new AppError("This device is not currently available.", 400);

    const weeks   = durationWeeks || PLAN_WEEKS[planType] || 16;
    const leaseId = await LeaseModel.create({ studentId, deviceId, planType, durationWeeks: weeks });

    await AuditLogModel.log({
      userId:     studentId,
      action:     "LEASE_APPLIED",
      entityType: "lease",
      entityId:   leaseId,
      details:    { deviceId, planType, weeks },
    });

    return leaseId;
  }

  /**
   * Admin approves a lease — sets dates and generates payment schedule.
   */
  static async approveLease(leaseId, adminId) {
    const lease = await LeaseModel.findById(leaseId);
    if (!lease) throw new AppError("Lease not found.", 404);
    if (lease.status !== leaseStatus.PENDING)
      throw new AppError(`Cannot approve a lease with status '${lease.status}'.`, 400);

    const startDate = new Date();
    const endDate   = addWeeks(startDate, lease.duration_weeks);

    await LeaseModel.updateStatus(leaseId, leaseStatus.ACTIVE, {
      startDate:  toMysqlDate(startDate),
      endDate:    toMysqlDate(endDate),
      approvedBy: adminId,
    });

    await DeviceModel.setStatus(lease.device_id, deviceStatus.LEASED);

    // Generate monthly payment schedule
    const months   = Math.ceil(lease.duration_weeks / 4);
    const dueDates = generateMonthlyDates(startDate, months);
    const payments = dueDates.map((dueDate) => ({
      leaseId,
      amount:  lease.monthly_rate,
      dueDate,
    }));
    await PaymentModel.bulkCreate(payments);

    await AuditLogModel.log({
      userId:     adminId,
      action:     "LEASE_APPROVED",
      entityType: "lease",
      entityId:   leaseId,
      details:    { studentId: lease.student_id, deviceId: lease.device_id },
    });

    return { startDate: toMysqlDate(startDate), endDate: toMysqlDate(endDate) };
  }

  /**
   * Admin rejects a lease application.
   */
  static async rejectLease(leaseId, adminId, rejectionNote) {
    const lease = await LeaseModel.findById(leaseId);
    if (!lease) throw new AppError("Lease not found.", 404);
    if (lease.status !== leaseStatus.PENDING)
      throw new AppError(`Cannot reject a lease with status '${lease.status}'.`, 400);

    await LeaseModel.updateStatus(leaseId, leaseStatus.REJECTED, { rejectionNote });

    await AuditLogModel.log({
      userId:     adminId,
      action:     "LEASE_REJECTED",
      entityType: "lease",
      entityId:   leaseId,
      details:    { reason: rejectionNote },
    });
  }

  /**
   * Mark a lease as returned and free up the device.
   */
  static async returnDevice(leaseId, adminId) {
    const lease = await LeaseModel.findById(leaseId);
    if (!lease) throw new AppError("Lease not found.", 404);
    if (lease.status !== leaseStatus.ACTIVE)
      throw new AppError("Only active leases can be returned.", 400);

    await LeaseModel.updateStatus(leaseId, leaseStatus.RETURNED);
    await DeviceModel.setStatus(lease.device_id, deviceStatus.AVAILABLE);

    await AuditLogModel.log({
      userId:     adminId,
      action:     "DEVICE_RETURNED",
      entityType: "lease",
      entityId:   leaseId,
      details:    { deviceId: lease.device_id },
    });
  }
}

module.exports = LeaseService;
