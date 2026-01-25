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

module.exports = { transporter, sendMail };
