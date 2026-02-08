const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, emailPhone, status, userRole } = require("../utils/staticExport");
const { Users, BlacklistTokens } = require("../models");
const { responseHandler, hashedPasswordCnv, comparePasswords } = require("../utils/helper");
const { beginEmailPhoneVerification, verifyingOTP, loginDetailsForToken } = require("../services/auth.service");
const { signAccess, resetToken } = require("../config/jwt");

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password || (!email && !phone))
      return next(new ErrorHandler(400, "Fields missing in request body", validErrorName.INVALID_REQUEST));
    const isExistingUser = await Users.findOne({
      attributes: ["id", "email", "phone", "deleted_at"],
      where: { ...(email ? { email } : { phone }) },
      paranoid: false,
    });
    if (isExistingUser && isExistingUser.deleted_at)
      return next(
        new ErrorHandler(
          400,
          `This account was previously deleted. Please contact support to reactivate your account.`,
          validErrorName.USER_ALREADY_EXISTS,
        ),
      );

    const msg = req.isEmail ? "email" : "phone number";
    if (isExistingUser) return next(new ErrorHandler(400, `User already exists with this ${msg}.`, validErrorName.USER_ALREADY_EXISTS));

    const hashPw = await hashedPasswordCnv(password);

    const newUser = await Users.create({
      ...(email ? { email } : { phone }),
      password: hashPw,
      name,
    });
    if (email) {
      await beginEmailPhoneVerification(email, newUser.id, emailPhone.EMAIL);
    } else {
      // otp =  otp for aws sns or any other method
      await beginEmailPhoneVerification(phone, newUser.id, emailPhone.PHONE);
    }
    responseHandler(res, 201, `One Time Password(OTP) sent to your ${msg}, Please verify.`, { user: newUser, isUserVerified: false });
  } catch (error) {
    next(error);
  }
};

const verifyingOTPController = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;
    if (!otp || (!email && !phone)) return next(new ErrorHandler(400, "Fields missing in request body", validErrorName.INVALID_REQUEST));
    const userExist = await Users.findOne({
      where: { ...(email ? { email } : { phone }) },
      attributes: ["email", "phone", "id", "is_email_verified", "is_phone_verified", "name", "role", "status"],
    });
    if (!userExist) return next(new ErrorHandler(404, `User not found with this ${email ? email : phone}`, validErrorName.USER_NOT_FOUND));

    const type = email ? emailPhone.EMAIL : emailPhone.PHONE;

    const verified = await verifyingOTP(userExist.id, otp, type);
    if (!verified.success) return next(new ErrorHandler(400, verified.message, validErrorName.VERIFICATION_FAILED));

    if (email) userExist.is_email_verified = true;
    if (phone) userExist.is_phone_verified = true;

    const insertionDataForJWT = loginDetailsForToken(userExist, email ? email : phone);

    const accessToken = signAccess(insertionDataForJWT);

    await userExist.save();

    responseHandler(res, 200, "Verified", { user: userExist, accessToken, isUserVerified: true });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) return next(new ErrorHandler(400, "Fields missing in request body", validErrorName.INVALID_REQUEST));

    const userExist = await Users.findOne({
      where: { ...(email ? { email } : { phone }) },
      attributes: ["email", "phone", "id", "is_email_verified", "is_phone_verified", "name", "role", "status", "password"],
    });
    if (!userExist) return next(new ErrorHandler(404, `User not found with this ${email ? email : phone}`, validErrorName.USER_NOT_FOUND));

    if (userExist.status !== status.ACTIVE)
      return next(new ErrorHandler(403, "Access Denied, Please connect with our support team", validErrorName.ACCESS_DENIED));

    if (userExist.role === userRole.ADMIN)
      return next(new ErrorHandler(403, "Access Denied. You cannot login with these credential", validErrorName.ACCESS_DENIED));

    if (!userExist.password || userExist.password === null || userExist.password === "")
      return next(new ErrorHandler(400, "Invalid password.", validErrorName.INVALID_PASSWORD));

    const isMatched = await comparePasswords(password, userExist.password);
    if (!isMatched) return next(new ErrorHandler(400, "Invalid password.", validErrorName.INVALID_PASSWORD));

    if (email && !userExist.is_email_verified) {
      otp = await beginEmailPhoneVerification(email, userExist.id, emailPhone.EMAIL);
      return responseHandler(res, 201, `One Time Password(OTP) sent to your ${email}, Please verify.`, { user: userExist, isUserVerified: false });
    }
    if (phone && !userExist.is_phone_verified) {
      otp = await beginEmailPhoneVerification(phone, userExist.id, emailPhone.PHONE);
      return responseHandler(res, 201, `One Time Password(OTP) sent to your ${email}, Please verify.`, { user: userExist, isUserVerified: false });
    }
    const insertionDataForJWT = loginDetailsForToken(userExist, email ? email : phone);
    const accessToken = signAccess(insertionDataForJWT);
    let user = null;
    if (userExist) {
      let { password, ...data } = userExist.toJSON();
      user = data;
    }
    responseHandler(res, 200, "User logged in successfully", { user, accessToken, isUserVerified: true });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return next(new ErrorHandler(400, "Email or phone is required", validErrorName.INVALID_REQUEST));
    }

    const userExist = await Users.findOne({
      where: { ...(email ? { email } : { phone }) },
      attributes: ["id", "email", "phone", "status", "is_email_verified", "is_phone_verified", "role"],
    });

    if (!userExist) return next(new ErrorHandler(404, `User not found with this ${email ? "email" : "phone number"}`, validErrorName.USER_NOT_FOUND));

    if (userExist.status !== status.ACTIVE) return next(new ErrorHandler(403, "Access Denied, Please contact support", validErrorName.ACCESS_DENIED));

    if (userExist.role !== userRole.USER)
      return next(new ErrorHandler(403, "Access Denied. You cannot login with these credential", validErrorName.ACCESS_DENIED));

    // Send OTP for password reset
    if (email) {
      await beginEmailPhoneVerification(email, userExist.id, emailPhone.EMAIL);
    } else {
      await beginEmailPhoneVerification(phone, userExist.id, emailPhone.PHONE);
    }

    responseHandler(res, 200, `One Time Password (OTP) sent to your ${email ? "email" : "phone number"}`, {
      isOtpSent: true,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPasswordVerifyOTP = async (req, res, next) => {
  try {
    const { otp, email, phone } = req.body;
    if ((!email && !phone) || !otp) return next(new ErrorHandler(400, "Email or phone is required", validErrorName.INVALID_REQUEST));

    const user = await Users.findOne({
      attributes: ["id", "email", "phone", "is_email_verified", "is_phone_verified"],
      where: { ...(email ? { email } : { phone }) },
    });

    if (!user) return next(new ErrorHandler(404, `User not found with this ${email ? "email" : "phone number"}.`, validErrorName.USER_NOT_FOUND));

    const type = email ? emailPhone.EMAIL : emailPhone.PHONE;

    const isOtpValid = await verifyingOTP(user.id, otp, type);

    if (!isOtpValid.success) {
      return next(new ErrorHandler(400, isOtpValid.message, validErrorName.UNEXPECTED_ERROR));
    }
    if (type === emailPhone.EMAIL && !user.is_email_verified) {
      user.is_email_verified = true;
      await user.save();
    }
    if (type === emailPhone.PHONE && !user.is_phone_verified) {
      user.is_phone_verified = true;
      await user.save();
    }
    const token = resetToken({ user_id: user.id, purpose: "reset_password" });
    responseHandler(res, 200, "OTP verified successfully! you can reset your password", { user, token });
  } catch (error) {
    next(error);
  }
};

const createNewPassword = async (req, res, next) => {
  try {
    const { new_password, reset_token } = req.body;
    if (!req.resetUserData) return next(new ErrorHandler(400, "Reset token not valid or expired", validErrorName.VERIFICATION_FAILED));

    const user = await Users.findOne({
      attributes: ["id", "email", "phone", "password"],
      where: { id: req.resetUserData.user_id },
    });

    if (!user) return next(new ErrorHandler(404, `User not found with this token.`, validErrorName.USER_NOT_FOUND));

    if (user.password !== null) {
      // before change password check if new password is same as old password
      const isSame = await comparePasswords(new_password, user.password);
      if (isSame) return next(new ErrorHandler(400, "New password cannot be same as old password", validErrorName.PASSWORD_MISMATCH));
    }
    const hashPw = await hashedPasswordCnv(new_password);
    user.password = hashPw;
    await user.save();
    await BlacklistTokens.create({
      access_token: reset_token,
    });
    responseHandler(res, 200, "Password reset successfully! Please login with new password");
  } catch (error) {
    next(error);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const msg = req.isEmail ? "email" : "phone number";
    if (!email && !phone) return next(new ErrorHandler(400, `Please provide ${msg}.`, validErrorName.INVALID_REQUEST));

    const user = await Users.findOne({
      attributes: ["id", "email", "phone"],
      where: { ...(email ? { email } : { phone }) },
    });
    if (!user) return next(new ErrorHandler(404, `User not found with this ${msg}.`, validErrorName.USER_NOT_FOUND));

    if (email) {
      await beginEmailPhoneVerification(email, user.id, emailPhone.EMAIL);
    } else {
      // otp =  otp for aws sns or any other method
      await beginEmailPhoneVerification(phone, user.id, emailPhone.PHONE);
    }
    responseHandler(res, 201, `OTP sent successfully, Please verify your ${msg}`, { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyingOTPController, loginUser, forgotPassword, forgotPasswordVerifyOTP, createNewPassword, resendOTP };
