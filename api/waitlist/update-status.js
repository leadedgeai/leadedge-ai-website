const { getPool, ensureTable } = require("../_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  try {
    const { id, status } = req.body || {};
    const validStatuses = ["pending", "contacted", "converted", "unsubscribed"];

    if (!id || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Valid id and status required" });
    }

    await ensureTable();
    const db = getPool();
    await db.execute("UPDATE waitlist_signups SET status = ? WHERE id = ?", [status, id]);

    return res.json({ success: true });
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
