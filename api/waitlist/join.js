const { getPool, ensureTable } = require("../_db");

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  try {
    const { email, name, agencyName, phone, plan, source } = req.body || {};

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    await ensureTable();
    const db = getPool();

    // Check if email already exists
    const [existing] = await db.execute("SELECT id FROM waitlist_signups WHERE email = ?", [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.json({ success: true, alreadyExists: true, message: "Already on the waitlist" });
    }

    await db.execute(
      "INSERT INTO waitlist_signups (email, name, agencyName, phone, plan, source) VALUES (?, ?, ?, ?, ?, ?)",
      [email.toLowerCase().trim(), name || null, agencyName || null, phone || null, plan || null, source || "website"]
    );

    return res.json({ success: true, alreadyExists: false, message: "Successfully joined the waitlist" });
  } catch (err) {
    console.error("Waitlist join error:", err);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
