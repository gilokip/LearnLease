const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || "localhost",
  port:             process.env.DB_PORT     || 3306,
  user:             process.env.DB_USER     || "root",
  password:         process.env.DB_PASS     || "",
  database:         process.env.DB_NAME     || "unilease",
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  timezone:         "Z",
});

pool.getConnection()
  .then((conn) => {
    console.log("✅ MySQL connected successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
