const db = require("../config/db");

class UserModel {
  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, name, email, role, student_id, is_active, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  }

  static async findAll({ role, search, limit = 100, offset = 0 } = {}) {
    let sql = `SELECT id, name, email, role, student_id, is_active, created_at
               FROM users WHERE 1 = 1`;
    const params = [];

    if (role)   { sql += " AND role = ?";                         params.push(role); }
    if (search) { sql += " AND (name LIKE ? OR email LIKE ?)";   params.push(`%${search}%`, `%${search}%`); }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ email, passwordHash, name, role, studentId }) {
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, name, role, student_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [email, passwordHash, name, role, studentId || null]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const allowed = ["name", "email", "is_active"];
    const sets    = [];
    const params  = [];

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = ?`);
        params.push(val);
      }
    }

    if (!sets.length) return false;

    sets.push("updated_at = NOW()");
    params.push(id);
    await db.query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, params);
    return true;
  }

  static async updatePassword(id, passwordHash) {
    await db.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [passwordHash, id]
    );
  }

  static async deactivate(id) {
    await db.query(
      "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [id]
    );
  }

  static async countByRole() {
    const [rows] = await db.query(
      "SELECT role, COUNT(*) AS total FROM users GROUP BY role"
    );
    return rows;
  }
}

module.exports = UserModel;
