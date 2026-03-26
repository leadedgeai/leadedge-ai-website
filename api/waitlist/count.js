const { getPool, ensureTable } = require("../_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await ensureTable();
    const db = getPool();
    const [rows] = await db.execute("SELECT COUNT(*) as count FROM waitlist_signups");
    return res.json({ count: rows[0].count });
  } catch (err) {
    console.error("Waitlist count error:", err);
    return res.json({ count: 0 });
  }
};
