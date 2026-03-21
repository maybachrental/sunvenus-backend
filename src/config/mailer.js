const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVICE_HOST,
  port: Number(process.env.SMTP_SERVICE_PORT || 587),
  secure: true,
  auth: { user: process.env.SMTP_USER_NAME, pass: process.env.SMTP_USER_PASSWORD },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready to send messages!");
  }
});

async function sendMail(to, subject, html) {
//   logger.info("sending Mail from sendMail Function log");
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
}

const sendMailBulk = async (emails, subject, html, options = {}) => {
  const { batchSize = 20, concurrency = 5, delayBetweenBatches = 1000 } = options;

  const sent = [];
  const failed = [];

  // Split into batches
  const batches = [];
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }

  console.log(`[Mailer] Starting bulk send — ${emails.length} emails, ` + `${batches.length} batch(es), concurrency=${concurrency}`);

  for (let bIdx = 0; bIdx < batches.length; bIdx++) {
    const batch = batches[bIdx];
    console.log(`[Mailer] Batch ${bIdx + 1}/${batches.length} — ${batch.length} emails`);

    // Process each batch with a concurrency limiter
    // Split batch into chunks of `concurrency` and run in parallel
    for (let i = 0; i < batch.length; i += concurrency) {
      const chunk = batch.slice(i, i + concurrency);

      const results = await Promise.allSettled(chunk.map((email) => sendMail(email, subject, html)));

      results.forEach((result, idx) => {
        const email = chunk[idx];
        if (result.status === "fulfilled") {
          sent.push(email);
          console.log(`[Mailer] ✓ ${email}`);
        } else {
          failed.push({ email, error: result.reason?.message || String(result.reason) });
          console.error(`[Mailer] ✗ ${email} — ${result.reason?.message}`);
        }
      });
    }

    // Wait between batches (skip delay after the last batch)
    if (bIdx < batches.length - 1 && delayBetweenBatches > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  console.log(`[Mailer] Done — ${sent.length} sent, ${failed.length} failed`);

  return { sent, failed };
};

module.exports = { transporter, sendMail, sendMailBulk };
