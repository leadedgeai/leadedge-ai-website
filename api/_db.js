const mysql = require("mysql2/promise");

let pool = null;

function getPool() {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL environment variable is not set");

    // Parse DATABASE_URL: mysql://user:pass@host:port/database
    const url = new URL(dbUrl);
    pool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 0,
      connectTimeout: 10000,
    });
  }
  return pool;
}

// Ensure the waitlist_signups table exists
async function ensureTable() {
  const db = getPool();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS waitlist_signups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(320) NOT NULL UNIQUE,
      name VARCHAR(255),
      agencyName VARCHAR(255),
      phone VARCHAR(50),
      plan VARCHAR(50),
      source VARCHAR(100) DEFAULT 'website',
      status ENUM('pending', 'contacted', 'converted', 'unsubscribed') DEFAULT 'pending' NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `);
}

module.exports = { getPool, ensureTable };
