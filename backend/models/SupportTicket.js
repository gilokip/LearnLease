const db = require("../config/db");

class SupportTicketModel {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT t.*, u.name AS user_name, u.email,
              a.name AS assigned_name
       FROM support_tickets t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByUser(userId) {
    const [rows] = await db.query(
      `SELECT t.*, a.name AS assigned_name
       FROM support_tickets t
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findAll({ status, priority, search, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT t.*, u.name AS user_name, u.email,
             a.name AS assigned_name
      FROM support_tickets t
      JOIN  users u ON t.user_id     = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1 = 1`;
    const params = [];

    if (status)   { sql += " AND t.status = ?";   params.push(status); }
    if (priority) { sql += " AND t.priority = ?"; params.push(priority); }
    if (search)   { sql += " AND (t.subject LIKE ? OR u.name LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

    sql += " ORDER BY FIELD(t.priority,'urgent','high','medium','low'), t.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ userId, leaseId, subject, description, priority }) {
    const [result] = await db.query(
      `INSERT INTO support_tickets (user_id, lease_id, subject, description, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'open', NOW())`,
      [userId, leaseId || null, subject, description || null, priority || "medium"]
    );
    return result.insertId;
  }

  static async update(id, { status, assignedTo, resolution }) {
    const sets   = ["updated_at = NOW()"];
    const params = [];

    if (status)     { sets.push("status = ?");      params.push(status); }
    if (assignedTo) { sets.push("assigned_to = ?"); params.push(assignedTo); }
    if (resolution) { sets.push("resolution = ?");  params.push(resolution); }
    if (status === "resolved") {
      sets.push("resolved_at = NOW()");
    }

    params.push(id);
    await db.query(`UPDATE support_tickets SET ${sets.join(", ")} WHERE id = ?`, params);
  }

  static async countByStatus() {
    const [rows] = await db.query(
      "SELECT status, COUNT(*) AS total FROM support_tickets GROUP BY status"
    );
    return rows;
  }
}

module.exports = SupportTicketModel;
