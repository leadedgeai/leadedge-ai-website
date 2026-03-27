const { getPool, ensureTable } = require("../_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await ensureTable();
    const db = getPool();
    const [rows] = await db.execute("SELECT * FROM waitlist_signups ORDER BY createdAt DESC");
    return res.json({ signups: rows });
  } catch (err) {
    console.error("Waitlist list error:", err.message);
    return res.status(500).json({ signups: [], message: err.message });
  }
};
