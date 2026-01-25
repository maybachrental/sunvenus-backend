const { sendMail } = require("../config/mailer");

async function sendEmailVerification(to, otp) {
  await sendMail(to, "Verify your email", `<p>Your OTP is ${otp}</p>`);
}

module.exports = { sendEmailVerification };
