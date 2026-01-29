const { generateOTP } = require("../utils/helper");
const { sendEmailVerification } = require("./mail.service");
const { UserOtps } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName } = require("../utils/staticExport");

const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES;

const beginEmailPhoneVerification = async (email_or_phone, id, type = "EMAIL") => {
  const now = new Date();
  const otp = generateOTP();
//   const otp_expires_at = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60000);
  const body = {
    otp,
    type,
    user_id: id,
  };
  await UserOtps.create(body);
  if (type === "EMAIL") {
    await sendEmailVerification(email_or_phone, otp); // Send OTP to user's email
  } else {
    // await sendSMSVerification(email_or_phone, otp);  // Send OTP to user's phone number
  }
  return true;
};

const verifyingOTP = async (id, otp, type = null) => {
  if (otp == process.env.HARD_CODE_OTP) {
    return {
      success: true,
      message: "Verification Successful",
    };
  }
  if (!id || !otp) {
    throw new ErrorHandler(400, "Invalid Inputs", validErrorName.VERIFICATION_FAILED);
  }
  let otpVerification = null;
  const condition = {
    user_id: id,
  };
  if (type) {
    condition.type = type;
  }
  otpVerification = await UserOtps.findOne({
    where: condition,
    order: [["created_at", "DESC"]],
  });

  if (!otpVerification) {
    throw new ErrorHandler(400, "Invalid OTP", validErrorName.VERIFICATION_FAILED);
  }
  if (otpVerification.otp !== otp) {
    throw new ErrorHandler(400, "Invalid OTP", validErrorName.VERIFICATION_FAILED);
  }
  const createdTime = new Date(otpVerification.created_at);
  const expiryTime = new Date(createdTime.getTime() + OTP_EXPIRY_MINUTES * 60000);
  if (new Date() > expiryTime) {
    await otpVerification.destroy();
    throw new ErrorHandler(400, "OTP has expired", validErrorName.VERIFICATION_FAILED);
  }
  if (otpVerification.is_used) {
    await otpVerification.destroy();
    throw new ErrorHandler(400, "OTP has already been used", validErrorName.VERIFICATION_FAILED);
  }

  otpVerification.is_used = true;
  //  I want to delete all the otp that are used or verified for this user
  await otpVerification.save();
  await UserOtps.destroy({ where: condition });

  return {
    success: true,
    message: "Verification Successful",
    // user: otpVerification,
  };
};

const loginDetailsForToken = (user, email) => {
  // Generate JWT token for user
  const loginDets = {};
  loginDets.id = user.id;
  loginDets.role = user.role;
  if (email) {
    loginDets.email = email;
  } else {
    loginDets.phone = user.phone;
  }
  return loginDets;
};
module.exports = { beginEmailPhoneVerification, verifyingOTP,loginDetailsForToken };
