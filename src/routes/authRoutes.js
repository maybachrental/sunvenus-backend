const {
  register,
  verifyingOTPController,
  loginUser,
  forgotPassword,
  forgotPasswordVerifyOTP,
  createNewPassword,
  resendOTP,
  googleLogin,
} = require("../controllers/authController");
const { checkIsTokenBlacklist } = require("../middlewares/authMiddleware");
const {
  validateRegisterBody,
  validateVerifyOTP,
  validateLoginBody,
  validationForgotField,
  validationVerifyOTP,
  validateNewPassword,
  validateSendOtp,
} = require("../validations/authValidator");

const router = require("express").Router();

router.post("/register", validateRegisterBody, register);

router.post("/verify-otp", validateVerifyOTP, verifyingOTPController);

router.post("/login", validateLoginBody, loginUser);

router.post("/forgot-password", validationForgotField, forgotPassword);

router.post("/forgot/verify-otp", validationVerifyOTP, forgotPasswordVerifyOTP);

router.post("/create-new-password", validateNewPassword, checkIsTokenBlacklist, createNewPassword);

router.post("/resend-otp", validateSendOtp, resendOTP);

router.post("/google-login", googleLogin);

module.exports = router;
