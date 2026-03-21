const { Op } = require("sequelize");
const { Users } = require("../../models");
const { sendMailBulk } = require("../../config/mailer");

const promoPage = async (req, res) => {
  const users = await Users.findAll({ attributes: ["id", "name", "email"], raw: true });
  res.render("admin/promotionals/promoEmails", { users });
};

// // GET /admin/api/users/search?q=
const searchUsersForPromo = async (req, res) => {
  const q = req.query.q || "";
  const users = await Users.findAll({
    where: { [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { email: { [Op.like]: `%${q}%` } }] },
    attributes: ["id", "name", "email"],
    limit: 30,
    raw: true,
  });
  res.json({ success: true, data: users });
};

// // POST /admin/api/promo-emails/send
const sendPromoMail = async (req, res) => {
  try {
    const { subject, html, recipients } = req.body;

    /* ── Validate input ── */
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ success: false, message: "Subject is required." });
    }

    if (!html || typeof html !== "string" || !html.trim()) {
      return res.status(400).json({ success: false, message: "Email body (html) is required." });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: "recipients must be a non-empty array." });
    }

    /* ── Resolve email list ── */
    let emails = [];

    if (recipients[0] === "all") {
      // Fetch every user's email from DB
      const rows = await Users.findAll({ attributes: ["email"], raw: true });
      emails = rows.map((u) => u.email).filter(Boolean);

      if (emails.length === 0) {
        return res.status(404).json({ success: false, message: "No users found in the database." });
      }
    } else {
      // Use provided list — basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalid = recipients.filter((e) => !emailRegex.test(e));

      if (invalid.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid email address(es): ${invalid.join(", ")}`,
        });
      }

      emails = recipients;
    }

    /* ── Send in batches ── */
    const { sent, failed } = await sendMailBulk(emails, subject.trim(), html, {
      batchSize: 20, // send 20 emails per batch
      concurrency: 5, // 5 parallel sends within each batch
      delayBetweenBatches: 1000, // 1 second pause between batches
    });

    /* ── Respond ── */
    return res.status(200).json({
      success: true,
      message: `Campaign sent. ${sent.length} delivered, ${failed.length} failed.`,
      sent: sent.length,
      failed: failed.length,
      // Optionally expose which addresses failed (useful for debugging)
      failedAddresses: failed.length > 0 ? failed : undefined,
    });
  } catch (err) {
    console.error("[sendPromoMail] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred. Please try again.",
    });
  }
};

module.exports = { promoPage, searchUsersForPromo, sendPromoMail };
