const db = require("../config/db");

class MaintenanceLogModel {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*, d.brand, d.model, d.serial_number,
              u.name AS reported_by_name
       FROM maintenance_logs m
       JOIN devices d ON m.device_id    = d.id
       JOIN users   u ON m.reported_by  = u.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByDevice(deviceId) {
    const [rows] = await db.query(
      `SELECT m.*, u.name AS reported_by_name
       FROM maintenance_logs m
       JOIN users u ON m.reported_by = u.id
       WHERE m.device_id = ?
       ORDER BY m.created_at DESC`,
      [deviceId]
    );
    return rows;
  }

  static async findAll({ status, search, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT m.*, d.brand, d.model, d.serial_number,
             u.name AS reported_by_name
      FROM maintenance_logs m
      JOIN devices d ON m.device_id   = d.id
      JOIN users   u ON m.reported_by = u.id
      WHERE 1 = 1`;
    const params = [];

    if (status) { sql += " AND m.status = ?"; params.push(status); }
    if (search) {
      sql += " AND (d.brand LIKE ? OR d.model LIKE ? OR d.serial_number LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY m.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ deviceId, reportedBy, issue }) {
    const [result] = await db.query(
      `INSERT INTO maintenance_logs (device_id, reported_by, issue, status, created_at)
       VALUES (?, ?, ?, 'reported', NOW())`,
      [deviceId, reportedBy, issue]
    );
    return result.insertId;
  }

  static async resolve(id, { resolution, cost }) {
    await db.query(
      `UPDATE maintenance_logs
       SET status = 'resolved', resolution = ?, cost = ?, resolved_at = NOW()
       WHERE id = ?`,
      [resolution || null, cost || null, id]
    );
  }

  static async updateStatus(id, status) {
    await db.query(
      "UPDATE maintenance_logs SET status = ? WHERE id = ?",
      [status, id]
    );
  }
}

module.exports = MaintenanceLogModel;
