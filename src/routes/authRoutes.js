const { register, verifyingOTPController, loginUser, forgotPassword, forgotPasswordVerifyOTP } = require("../controllers/authController");
const { validateRegisterBody, validateVerifyOTP, validateLoginBody, validationForgotField, validationVerifyOTP } = require("../validations/authValidator");

const router = require("express").Router();

router.post("/register", validateRegisterBody, register);

router.post("/verify-otp", validateVerifyOTP, verifyingOTPController);

router.post("/login", validateLoginBody, loginUser);

router.post("/forgot-password", validationForgotField, forgotPassword);

router.post("/forgot/verify-otp", validationVerifyOTP, forgotPasswordVerifyOTP);

module.exports = router;
