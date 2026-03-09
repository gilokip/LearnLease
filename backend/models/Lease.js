const db = require("../config/db");

class LeaseModel {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT l.*, d.brand, d.model, d.serial_number, d.monthly_rate,
              u.name AS student_name, u.email AS student_email, u.student_id
       FROM leases l
       JOIN devices d ON l.device_id = d.id
       JOIN users   u ON l.student_id = u.id
       WHERE l.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByStudent(studentId) {
    const [rows] = await db.query(
      `SELECT l.*, d.brand, d.model, d.serial_number, d.monthly_rate
       FROM leases l
       JOIN devices d ON l.device_id = d.id
       WHERE l.student_id = ?
       ORDER BY l.created_at DESC`,
      [studentId]
    );
    return rows;
  }

  static async findActiveByStudent(studentId) {
    const [rows] = await db.query(
      "SELECT * FROM leases WHERE student_id = ? AND status IN ('active','pending')",
      [studentId]
    );
    return rows[0] || null;
  }

  static async findAll({ status, search, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT l.*, d.brand, d.model, d.serial_number,
             u.name AS student_name, u.email AS student_email
      FROM leases l
      JOIN devices d ON l.device_id = d.id
      JOIN users   u ON l.student_id = u.id
      WHERE 1 = 1`;
    const params = [];

    if (status) { sql += " AND l.status = ?"; params.push(status); }
    if (search) {
      sql += " AND (u.name LIKE ? OR u.email LIKE ? OR d.serial_number LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY l.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ studentId, deviceId, planType, durationWeeks }) {
    const [result] = await db.query(
      `INSERT INTO leases (student_id, device_id, plan_type, duration_weeks, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [studentId, deviceId, planType, durationWeeks || 16]
    );
    return result.insertId;
  }

  static async updateStatus(id, status, extra = {}) {
    let sql    = "UPDATE leases SET status = ?, updated_at = NOW()";
    const params = [status];

    if (extra.startDate)      { sql += ", start_date = ?";       params.push(extra.startDate); }
    if (extra.endDate)        { sql += ", end_date = ?";         params.push(extra.endDate); }
    if (extra.approvedBy)     { sql += ", approved_by = ?";      params.push(extra.approvedBy); }
    if (extra.rejectionNote)  { sql += ", rejection_note = ?";   params.push(extra.rejectionNote); }

    sql += " WHERE id = ?";
    params.push(id);
    await db.query(sql, params);
  }

  static async countByStatus() {
    const [rows] = await db.query(
      "SELECT status, COUNT(*) AS total FROM leases GROUP BY status"
    );
    return rows;
  }

  static async findExpiring(days = 7) {
    const [rows] = await db.query(
      `SELECT l.*, u.name AS student_name, u.email, d.brand, d.model
       FROM leases l
       JOIN users u ON l.student_id = u.id
       JOIN devices d ON l.device_id = d.id
       WHERE l.status = 'active' AND l.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
      [days]
    );
    return rows;
  }
}

module.exports = LeaseModel;
