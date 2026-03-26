const { getPool, ensureTable } = require("../_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    await ensureTable();
    const db = getPool();
    await db.execute("DELETE FROM waitlist_signups WHERE id = ?", [id]);

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
