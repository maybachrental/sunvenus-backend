const { sendMail } = require("../config/mailer");
const { contactFormTemplate } = require("../utils/emailTemplates");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName } = require("../utils/staticExport");

const submitContactForm = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new ErrorHandler(400, "Please fill the data", validErrorName.BAD_REQUEST);
    }
    const { firstName, lastName, email, phone, service, message } = req.body;

    // Basic validation (optional but recommended)
    if (!firstName || !lastName || !email || !message) {
      throw new ErrorHandler(400, "Please fill the required fields", validErrorName.BAD_REQUEST);
    }

    // Email content
    const subject = `New Contact Form Submission - ${service || "General Inquiry"}`;

    const html = contactFormTemplate(firstName, lastName, email, phone, service, message);
    // Call your sendEmail function
    await sendMail(
      process.env.CLIENT_EMAIL, // client's email from env
      subject,
      html,
    );

    return res.status(200).json({
      success: true,
      message: "Your form has been submitted. Will reach you soon!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactForm };
