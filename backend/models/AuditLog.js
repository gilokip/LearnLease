const db = require("../config/db");

class AuditLogModel {
  static async log({ userId, action, entityType, entityId, details, ipAddress }) {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId     || null,
        action,
        entityType || null,
        entityId   || null,
        details ? JSON.stringify(details) : null,
        ipAddress  || null,
      ]
    );
  }

  static async findAll({ userId, action, entityType, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT a.*, u.name AS user_name, u.email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1 = 1`;
    const params = [];

    if (userId)     { sql += " AND a.user_id = ?";      params.push(userId); }
    if (action)     { sql += " AND a.action = ?";       params.push(action); }
    if (entityType) { sql += " AND a.entity_type = ?";  params.push(entityType); }

    sql += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = AuditLogModel;
