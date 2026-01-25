const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../utils/errorHandler");
const { validErrorName } = require("../utils/staticExport");

const validateRequestBody = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arrArr = errors.array();
    return next(new ErrorHandler(400, "Validation Error", validErrorName.VALIDATION_FAILED, arrArr));
  }
  next();
};

const validateRegisterRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errArray = errors.array();
    return next(new ErrorHandler(400, "Validation failed", validErrorName.VALIDATION_FAILED, errArray));
  }

  // detect email vs phone and map to new fields
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(req.body.email_phone)) {
    req.isEmail = true;
    req.body.email = req.body.email_phone;
  } else {
    req.isEmail = false;
    req.body.phone = req.body.email_phone;
  }
  delete req.body.email_phone;
  next();
};

exports.validateRegisterBody = [
  body("email_phone")
    .notEmpty()
    .withMessage("Email or Phone number is required")
    .custom((value) => {
      const emailRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length

      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Invalid Email or Phone number");
      }
      return true;
    }),
  body("name").notEmpty().withMessage("Name is required"),
  body("password").notEmpty().withMessage("Password is required"),

  validateRegisterRequest,
];

exports.validateVerifyOTP = [
  body("email_phone")
    .notEmpty()
    .withMessage("Email or Phone number is required")
    .custom((value) => {
      const emailRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length

      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Invalid Email or Phone number");
      }
      return true;
    }),
  body("otp").notEmpty().withMessage("OTP is required"),
  validateRegisterRequest,
];

exports.validateLoginBody = [
  body("email_phone")
    .notEmpty()
    .withMessage("Email or Phone number is required")
    .custom((value) => {
      const emailRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length

      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Invalid Email or Phone number");
      }
      return true;
    }),
  body("password").notEmpty().withMessage("Password is required"),
  validateRegisterRequest,
];

exports.validationForgotField = [
  body("email_phone")
    .notEmpty()
    .withMessage("Email or Phone number is required")
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length

      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Invalid Email or Phone number");
      }
      return true;
    }),
  validateRegisterRequest,
];

exports.validationVerifyOTP = [
  body("email_phone")
    .notEmpty()
    .withMessage("Email or Phone number is required")
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length

      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Invalid Email or Phone number");
      }
      return true;
    }),
  body("otp").notEmpty().isLength({ min: 6, max: 6 }).withMessage("OTP is required and should be 6 digits"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArray = errors.array();
      return next(new ErrorHandler(400, "Validation failed", validErrorName.VALIDATION_FAILED, errArray));
    }

    // detect email vs phone and map to new fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(req.body.email_phone)) {
      req.isEmail = true;
      req.body.email = req.body.email_phone;
    } else {
      req.isEmail = false;
      req.body.phone = req.body.email_phone;
    }
    delete req.body.email_phone;
    next();
  },
];

exports.validateNewPassword = [
  body("new_password").notEmpty().isLength({ min: 8 }).withMessage("New password is required and min 8 characters"),
  body("confirm_password").notEmpty().isLength({ min: 8 }).withMessage("Confirm password is required"),
  body("confirm_password")
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage("Confirm password does not match with new password"),
  body("reset_token").notEmpty().withMessage("Reset token should be provided"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArray = errors.array();
      return next(new ErrorHandler(400, "Validation failed for new password", validErrorName.VALIDATION_FAILED, errArray));
    }
    // detect email vs phone and map to new fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(req.body.email_phone)) {
      req.isEmail = true;
      req.body.email = req.body.email_phone;
    } else {
      req.isEmail = false;
      req.body.phone = req.body.email_phone;
    }
    delete req.body.email_phone;
    next();
  },
];

exports.validateSendOtp = [
  body("email_phone")
    .notEmpty()
    .withMessage("Email or Phone number is required")
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length

      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Invalid Email or Phone number");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArray = errors.array();
      return next(new ErrorHandler(400, "Validation failed", validErrorName.VALIDATION_FAILED, errArray));
    }

    // detect email vs phone and map to new fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(req.body.email_phone)) {
      req.isEmail = true;
      req.body.email = req.body.email_phone;
    } else {
      req.isEmail = false;
      req.body.phone = req.body.email_phone;
    }
    delete req.body.email_phone;

    next();
  },
];