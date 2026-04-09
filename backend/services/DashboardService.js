const DeviceModel        = require("../models/Device");
const LeaseModel         = require("../models/Lease");
const UserModel          = require("../models/User");
const PaymentModel       = require("../models/Payment");
const SupportTicketModel = require("../models/SupportTicket");
const MaintenanceLog     = require("../models/MaintenanceLog");
const db                 = require("../config/db");

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

    const leaseMap  = Object.fromEntries(leases.map(r  => [r.status, Number(r.total)]));
    const userMap   = Object.fromEntries(users.map(r   => [r.role,   Number(r.total)]));
    const ticketMap = Object.fromEntries(tickets.map(r => [r.status, Number(r.total)]));

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

    const nextDue = payments.find(p => p.status === "pending") || null;
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
   * Stats for inventory role — returns full AdminStats shape so the
   * frontend can use adminData.devices, adminData.leases, etc. consistently.
   */
  static async getInventoryStats() {
    const [devices, leases, maintenance] = await Promise.all([
      DeviceModel.getInventorySummary(),
      LeaseModel.countByStatus(),
      MaintenanceLog.findAll({ limit: 5 }),
    ]);

    const leaseMap = Object.fromEntries(leases.map(r => [r.status, Number(r.total)]));

    return {
      devices,
      leases:            { ...leaseMap, total: leases.reduce((s, r) => s + Number(r.total), 0) },
      recentMaintenance: maintenance,
      // stub remaining fields so frontend destructuring never throws
      users:    {},
      payments: { monthly: 0, annual: 0, pending: { count: 0, amount: 0 }, overdue: { count: 0, amount: 0 } },
      tickets:  {},
    };
  }

  /**
   * Stats for finance role — returns full AdminStats shape.
   */
  static async getFinanceStats() {
    const [payments, leases] = await Promise.all([
      PaymentModel.getSummary(),
      LeaseModel.countByStatus(),
    ]);

    const leaseMap = Object.fromEntries(leases.map(r => [r.status, Number(r.total)]));

    return {
      payments,
      leases:  { ...leaseMap, total: leases.reduce((s, r) => s + Number(r.total), 0) },
      // stub remaining fields
      devices: { total: 0, available: 0, leased: 0, maintenance: 0, decommissioned: 0 },
      users:   {},
      tickets: {},
    };
  }

  /**
   * Recent activity feed — last 10 notable events across leases,
   * payments, maintenance, and tickets, merged and sorted by time.
   */
  static async getRecentActivity(limit = 10) {
    const [recentLeases, recentPayments, recentMaintenance, recentTickets] = await Promise.all([
      db.query(`
        SELECT l.id, l.status, l.updated_at AS ts,
               u.name AS student_name,
               d.brand, d.model
        FROM leases l
        JOIN users   u ON l.student_id = u.id
        JOIN devices d ON l.device_id  = d.id
        ORDER BY l.updated_at DESC LIMIT 5
      `),
      db.query(`
        SELECT p.id, p.status, p.paid_date AS ts,
               u.name AS student_name,
               p.amount
        FROM payments p
        JOIN leases  l ON p.lease_id   = l.id
        JOIN users   u ON l.student_id = u.id
        WHERE p.status = 'paid'
        ORDER BY p.paid_date DESC LIMIT 5
      `),
      db.query(`
        SELECT m.id, m.status, m.created_at AS ts,
               u.name AS reported_by_name,
               d.brand, d.model
        FROM maintenance_logs m
        JOIN devices d ON m.device_id   = d.id
        JOIN users   u ON m.reported_by = u.id
        ORDER BY m.created_at DESC LIMIT 5
      `),
      db.query(`
        SELECT t.id, t.status, t.created_at AS ts,
               u.name AS user_name,
               t.subject
        FROM support_tickets t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC LIMIT 5
      `),
    ]);

    const events = [];

    for (const row of recentLeases[0]) {
      const label =
          row.status === "active"   ? `Lease approved for ${row.student_name}`   :
              row.status === "pending"  ? `New application from ${row.student_name}` :
                  row.status === "returned" ? `Device returned by ${row.student_name}`   :
                      row.status === "rejected" ? `Application rejected: ${row.student_name}` :
                          `Lease updated for ${row.student_name}`;
      events.push({ type: "lease", icon: row.status === "active" ? "approved" : row.status === "pending" ? "application" : "returned", label, subtitle: `${row.brand} ${row.model}`, ts: row.ts });
    }

    for (const row of recentPayments[0]) {
      events.push({ type: "payment", icon: "payment", label: `Payment received from ${row.student_name}`, subtitle: `KES ${Number(row.amount).toLocaleString()}`, ts: row.ts });
    }

    for (const row of recentMaintenance[0]) {
      events.push({ type: "maintenance", icon: "maintenance", label: `Maintenance ${row.status}: ${row.brand} ${row.model}`, subtitle: `Reported by ${row.reported_by_name}`, ts: row.ts });
    }

    for (const row of recentTickets[0]) {
      events.push({ type: "ticket", icon: "ticket", label: `New ticket: ${row.subject}`, subtitle: `From ${row.user_name}`, ts: row.ts });
    }

    events.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return events.slice(0, limit);
  }

  /**
   * Recent activity scoped to a single student.
   */
  static async getStudentRecentActivity(studentId, limit = 5) {
    const [leases, payments, tickets] = await Promise.all([
      db.query(`
        SELECT l.id, l.status, l.updated_at AS ts, d.brand, d.model
        FROM leases l
        JOIN devices d ON l.device_id = d.id
        WHERE l.student_id = ?
        ORDER BY l.updated_at DESC LIMIT 5
      `, [studentId]),
      db.query(`
        SELECT p.id, p.status, p.paid_date AS ts, p.amount, p.due_date
        FROM payments p
        JOIN leases l ON p.lease_id = l.id
        WHERE l.student_id = ?
        ORDER BY COALESCE(p.paid_date, p.due_date) DESC LIMIT 5
      `, [studentId]),
      db.query(`
        SELECT t.id, t.status, t.created_at AS ts, t.subject
        FROM support_tickets t
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC LIMIT 5
      `, [studentId]),
    ]);

    const events = [];

    for (const row of leases[0]) {
      const label =
          row.status === "active"   ? "Your lease was approved"      :
              row.status === "pending"  ? "Application submitted"         :
                  row.status === "returned" ? "Device returned successfully"  :
                      row.status === "rejected" ? "Application was rejected"      :
                          "Lease status updated";
      events.push({ type: "lease", icon: row.status === "active" ? "approved" : row.status === "pending" ? "application" : "returned", label, subtitle: `${row.brand} ${row.model}`, ts: row.ts });
    }

    for (const row of payments[0]) {
      const label = row.status === "paid" ? `Payment confirmed` : row.status === "overdue" ? "Payment overdue" : "Payment due soon";
      events.push({ type: "payment", icon: "payment", label, subtitle: row.amount ? `KES ${Number(row.amount).toLocaleString()}` : "", ts: row.ts || row.due_date });
    }

    for (const row of tickets[0]) {
      events.push({ type: "ticket", icon: "ticket", label: `Support ticket: ${row.subject}`, subtitle: row.status, ts: row.ts });
    }

    events.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return events.slice(0, limit);
  }
}

module.exports = DashboardService;