const db = require("../config/db");

class DeviceModel {
  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM devices WHERE id = ?", [id]);
    return rows[0] || null;
  }

  static async findBySerial(serialNumber) {
    const [rows] = await db.query(
      "SELECT * FROM devices WHERE serial_number = ?",
      [serialNumber]
    );
    return rows[0] || null;
  }

  static async findAll({ status, search, campusLocation, limit = 100, offset = 0 } = {}) {
    let sql    = "SELECT * FROM devices WHERE 1 = 1";
    const params = [];

    if (status)         { sql += " AND status = ?";                          params.push(status); }
    if (campusLocation) { sql += " AND campus_location = ?";                 params.push(campusLocation); }
    if (search)         { sql += " AND (brand LIKE ? OR model LIKE ? OR serial_number LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    sql += " ORDER BY brand, model LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ brand, model, serialNumber, specs, monthlyRate, campusLocation, purchasedDate }) {
    const [result] = await db.query(
      `INSERT INTO devices (brand, model, serial_number, specs, monthly_rate,
        campus_location, status, purchased_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'available', ?, NOW())`,
      [brand, model, serialNumber, specs || null, monthlyRate, campusLocation || null, purchasedDate || null]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const allowed = ["brand", "model", "specs", "monthly_rate", "campus_location", "status", "condition_notes"];
    const sets    = [];
    const params  = [];

    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (allowed.includes(col)) {
        sets.push(`${col} = ?`);
        params.push(val);
      }
    }

    if (!sets.length) return false;
    sets.push("updated_at = NOW()");
    params.push(id);
    await db.query(`UPDATE devices SET ${sets.join(", ")} WHERE id = ?`, params);
    return true;
  }

  static async setStatus(id, status) {
    await db.query(
      "UPDATE devices SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );
  }

  static async countByStatus() {
    const [rows] = await db.query(
      "SELECT status, COUNT(*) AS total FROM devices GROUP BY status"
    );
    return rows;
  }

  static async getInventorySummary() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'available')      AS available,
        SUM(status = 'leased')         AS leased,
        SUM(status = 'maintenance')    AS maintenance,
        SUM(status = 'decommissioned') AS decommissioned
      FROM devices
    `);
    return rows[0];
  }
}

module.exports = DeviceModel;
