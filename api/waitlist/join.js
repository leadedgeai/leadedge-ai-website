const { getPool, ensureTable } = require("../_db");
const { Resend } = require("resend");

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

    // Send emails via Resend (non-blocking — don't fail signup if email fails)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const displayName = name || email;
        const planLabel = plan || "Not specified";
        const agencyLabel = agencyName || "Not specified";
        const phoneLabel = phone || "Not specified";

        // 1. Admin notification email
        await resend.emails.send({
          from: "LeadEdge AI <hello@leadedgeai.com.au>",
          to: ["hello@leadedgeai.com.au"],
          subject: `\uD83D\uDD25 New Waitlist Signup \u2014 ${displayName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050D1A; color: #ffffff; padding: 32px; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #C9A84C; font-size: 28px; margin: 0;">LeadEdge AI</h1>
                <p style="color: #8899aa; margin: 8px 0 0;">New Waitlist Signup</p>
              </div>
              <div style="background: #0a1628; border: 1px solid #1e3a5f; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #C9A84C; font-size: 18px; margin: 0 0 16px;">Signup Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="color: #8899aa; padding: 6px 0; width: 120px;">Name</td><td style="color: #ffffff; padding: 6px 0;">${displayName}</td></tr>
                  <tr><td style="color: #8899aa; padding: 6px 0;">Email</td><td style="color: #ffffff; padding: 6px 0;">${email}</td></tr>
                  <tr><td style="color: #8899aa; padding: 6px 0;">Agency</td><td style="color: #ffffff; padding: 6px 0;">${agencyLabel}</td></tr>
                  <tr><td style="color: #8899aa; padding: 6px 0;">Phone</td><td style="color: #ffffff; padding: 6px 0;">${phoneLabel}</td></tr>
                  <tr><td style="color: #8899aa; padding: 6px 0;">Plan</td><td style="color: #C9A84C; padding: 6px 0; font-weight: bold;">${planLabel}</td></tr>
                </table>
              </div>
              <div style="text-align: center;">
                <a href="https://leadedgeai.com.au/admin" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #e8c96a); color: #050D1A; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Admin Dashboard</a>
              </div>
            </div>
          `,
        });

        // 2. User confirmation email
        await resend.emails.send({
          from: "LeadEdge AI <hello@leadedgeai.com.au>",
          to: [email.toLowerCase().trim()],
          subject: "You're on the LeadEdge AI waitlist \uD83C\uDF89",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050D1A; color: #ffffff; padding: 32px; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #C9A84C; font-size: 32px; margin: 0;">LeadEdge AI</h1>
                <p style="color: #8899aa; margin: 8px 0 0;">AI-Powered Lead Management for Real Estate</p>
              </div>
              <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px;">You're in, ${displayName}! \uD83C\uDF89</h2>
              <p style="color: #aabbcc; line-height: 1.6; margin: 0 0 20px;">
                Thanks for joining the LeadEdge AI waitlist. You're among the first agents to get access to the platform that's going to transform how you manage leads.
              </p>
              <div style="background: #0a1628; border: 1px solid #C9A84C33; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #C9A84C; margin: 0 0 12px;">What happens next:</h3>
                <ul style="color: #aabbcc; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>We'll notify you as soon as early access opens</li>
                  <li>Waitlist members get <strong style="color: #C9A84C;">priority access</strong> and exclusive launch pricing</li>
                  <li>You'll be the first to see new features before anyone else</li>
                </ul>
              </div>
              <p style="color: #8899aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                In the meantime, if you have any questions, reply to this email or contact us at <a href="mailto:hello@leadedgeai.com.au" style="color: #C9A84C;">hello@leadedgeai.com.au</a>
              </p>
              <div style="text-align: center; border-top: 1px solid #1e3a5f; padding-top: 24px;">
                <p style="color: #8899aa; font-size: 12px; margin: 0;">\u00A9 2026 LeadEdge AI \u00B7 Australia</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        // Log but don't fail the signup
        console.error("Email send error:", emailErr);
      }
    }

    return res.json({ success: true, alreadyExists: false, message: "Successfully joined the waitlist" });
  } catch (err) {
    console.error("Waitlist join error:", err);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
