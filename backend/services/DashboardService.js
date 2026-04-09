const DeviceModel        = require("../models/Device");
const LeaseModel         = require("../models/Lease");
const UserModel          = require("../models/User");
const PaymentModel       = require("../models/Payment");
const SupportTicketModel = require("../models/SupportTicket");
const MaintenanceLog     = require("../models/MaintenanceLog");

class DashboardService {
  /**
   * Aggregated stats for the admin overview.
   */
  static async getAdminStats() {
    const [devices, leases, users, payments, tickets] = await Promise.all([
      DeviceModel.getInventorySummary(),
      LeaseModel.countByStatus(),
      UserModel.countByRole(),
      PaymentModel.getSummary(),
      SupportTicketModel.countByStatus(),
    ]);

    const leaseMap  = Object.fromEntries(leases.map(r  => [r.status, r.total]));
    const userMap   = Object.fromEntries(users.map(r   => [r.role,   r.total]));
    const ticketMap = Object.fromEntries(tickets.map(r => [r.status, r.total]));

    return {
      devices,
      leases:  { ...leaseMap, total: leases.reduce((s, r) => s + Number(r.total), 0) },
      users:   { ...userMap,  total: users.reduce((s,  r) => s + Number(r.total), 0) },
      payments,
      tickets: ticketMap,
    };
  }

  /**
   * Stats visible to a student.
   */
  static async getStudentStats(studentId) {
    const leases  = await LeaseModel.findByStudent(studentId);
    const active  = leases.find(l => l.status === "active")  || null;
    const pending = leases.find(l => l.status === "pending") || null;

    const payments = active
        ? await PaymentModel.findByLease(active.id)
        : [];

    const nextDue = payments.find(p => p.status === "pending")   || null;
    const overdue = payments.filter(p => p.status === "overdue");

    return {
      activeLease:   active,
      pendingLease:  pending,
      nextPayment:   nextDue,
      overdueCount:  overdue.length,
      overdueAmount: overdue.reduce((s, p) => s + Number(p.amount), 0),
      leaseHistory:  leases,
    };
  }

  /**
   * Stats for inventory dashboard.
   */
  static async getInventoryStats() {
    const [summary, recentMaintenance] = await Promise.all([
      DeviceModel.getInventorySummary(),
      MaintenanceLog.findAll({ status: "in_progress", limit: 5 }),
    ]);
    return { summary, recentMaintenance };
  }

  /**
   * Stats for finance dashboard.
   */
  static async getFinanceStats() {
    return PaymentModel.getSummary();
  }
}

module.exports = DashboardService;