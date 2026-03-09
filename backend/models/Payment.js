const db = require("../config/db");

class PaymentModel {
  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM payments WHERE id = ?", [id]);
    return rows[0] || null;
  }

  static async findByLease(leaseId) {
    const [rows] = await db.query(
      "SELECT * FROM payments WHERE lease_id = ? ORDER BY due_date ASC",
      [leaseId]
    );
    return rows;
  }

  static async findByStudent(studentId) {
    const [rows] = await db.query(
      `SELECT p.*, l.plan_type, d.brand, d.model
       FROM payments p
       JOIN leases  l ON p.lease_id  = l.id
       JOIN devices d ON l.device_id = d.id
       WHERE l.student_id = ?
       ORDER BY p.due_date DESC`,
      [studentId]
    );
    return rows;
  }

  static async findAll({ status, search, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT p.*, u.name AS student_name, u.email,
             d.brand, d.model
      FROM payments p
      JOIN leases  l ON p.lease_id  = l.id
      JOIN users   u ON l.student_id = u.id
      JOIN devices d ON l.device_id  = d.id
      WHERE 1 = 1`;
    const params = [];

    if (status) { sql += " AND p.status = ?";            params.push(status); }
    if (search) { sql += " AND (u.name LIKE ? OR u.email LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

    sql += " ORDER BY p.due_date DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ leaseId, amount, dueDate }) {
    const [result] = await db.query(
      "INSERT INTO payments (lease_id, amount, due_date, status, created_at) VALUES (?, ?, ?, 'pending', NOW())",
      [leaseId, amount, dueDate]
    );
    return result.insertId;
  }

  static async bulkCreate(payments) {
    if (!payments.length) return;
    const values = payments.map(() => "(?, ?, ?, 'pending', NOW())").join(", ");
    const params = payments.flatMap(p => [p.leaseId, p.amount, p.dueDate]);
    await db.query(
      `INSERT INTO payments (lease_id, amount, due_date, status, created_at) VALUES ${values}`,
      params
    );
  }

  static async markPaid(id, { paidDate, paymentRef }) {
    await db.query(
      "UPDATE payments SET status = 'paid', paid_date = ?, payment_ref = ? WHERE id = ?",
      [paidDate || new Date(), paymentRef || null, id]
    );
  }

  static async markOverdue() {
    const [result] = await db.query(
      "UPDATE payments SET status = 'overdue' WHERE status = 'pending' AND due_date < CURDATE()"
    );
    return result.affectedRows;
  }

  static async getSummary() {
    const [[monthly]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total FROM payments
      WHERE status = 'paid'
        AND MONTH(paid_date) = MONTH(NOW())
        AND YEAR(paid_date)  = YEAR(NOW())`);

    const [[annual]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total FROM payments
      WHERE status = 'paid' AND YEAR(paid_date) = YEAR(NOW())`);

    const [[pending]] = await db.query(`
      SELECT COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total
      FROM payments WHERE status = 'pending'`);

    const [[overdue]] = await db.query(`
      SELECT COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total
      FROM payments WHERE status = 'overdue'`);

    return {
      monthly:  monthly.total,
      annual:   annual.total,
      pending:  { count: pending.cnt,  amount: pending.total },
      overdue:  { count: overdue.cnt,  amount: overdue.total },
    };
  }
}

module.exports = PaymentModel;
