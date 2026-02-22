const { body, validationResult, query, param } = require("express-validator");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, tripType, tripTypes } = require("../utils/staticExport");

const validateRequestBody = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arrArr = errors.array();
    return next(new ErrorHandler(400, "Validation Error", validErrorName.VALIDATION_FAILED, arrArr));
  }
  next();
};

exports.validateCarAvailabilityBody = [
  body("trip_type")
    .trim()
    .notEmpty()
    .isIn([...tripType])
    .withMessage(`Trip Type is required, Values should be > ${tripType}`),
  body("pickup_datetime")
    .notEmpty()
    .withMessage("Pickup datetime is required")
    .isISO8601({ strict: true })
    .withMessage("Pickup datetime must be valid ISO 8601 format"),
  body("drop_datetime")
    .optional()
    .notEmpty()
    .withMessage("Drop datetime is required")
    .isISO8601({ strict: true })
    .withMessage("Drop datetime must be valid ISO 8601 format"),
  body("duration_hours").optional().isInt({ min: 1, max: 25 }).isIn([8, 12, 24]).withMessage("Duration hours must be between 1 and 72"),
  body("included_km").optional().isInt({ min: 1, max: 251 }).isIn([80, 120, 250]).withMessage("Km must be between 1 and 251"),
  body("sort_by").optional().isIn(["newest", "oldest", "price_low", "price_high"]).withMessage("Invalid sort_by value"),
  // Custom date-time comparison
  body().custom((value, { req }) => {
    if (req.query.trip_type === tripTypes.ROUND_TRIP) {
      const pickup = new Date(req.body.pickup_datetime);
      const drop = new Date(req.body.drop_datetime);
      if (pickup >= drop) {
        return next(new ErrorHandler(400, "Drop date/time must be after pickup date/time"));
      }
    }
    return true;
  }),

  // Final error handler
  validateRequestBody,
];

exports.validateSelectedCarData = [
  query("trip_type")
    .trim()
    .notEmpty()
    .isIn([...tripType])
    .withMessage(`Trip Type is required, Values should be > ${tripType}`),
  query("pickup_datetime")
    .notEmpty()
    .withMessage("Pickup datetime is required")
    .isISO8601({ strict: true })
    .withMessage("Pickup datetime must be valid ISO 8601 format"),
  query("drop_datetime")
    .optional()
    .notEmpty()
    .withMessage("Drop datetime is required")
    .isISO8601({ strict: true })
    .withMessage("Drop datetime must be valid ISO 8601 format"),
  query("duration_hours").optional().isNumeric().isIn([8, 12, 24]).withMessage("Duration hours can be 8, 12 or 24"),
  query("included_km").optional().isNumeric().isIn([80, 120, 250]).withMessage("Km must be 80, 120 or 250"),
  param("car_id").notEmpty().isNumeric().withMessage("Car id is required"),
  // Custom date-time comparison
  query().custom((value, { req }) => {
    if (req.query.trip_type === tripTypes.ROUND_TRIP) {
      const pickup = new Date(req.query.pickup_datetime);
      const drop = new Date(req.query.drop_datetime);
      if (pickup >= drop) {
        return next(new ErrorHandler(400, "Drop date/time must be after pickup date/time"));
      }
    }
    return true;
  }),

  // Final error handler
  validateRequestBody,
];

exports.validateCreateBooking = [
  body("car_id").trim().notEmpty().withMessage("car id is required"),
  body("full_pick_address").optional().trim().notEmpty().withMessage("Full Pick Address is required"),
  body("full_drop_address").optional().trim().notEmpty().withMessage("Full Drop Address is required"),
  body("pickup_location").trim().notEmpty().withMessage("Pickup location is required"),
  body("drop_location").optional().trim().notEmpty().withMessage("Drop location is required"),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .custom((value) => {
      const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7–15 length
      if (!phoneRegex.test(value)) {
        throw new ErrorHandler(400, "Valid Phone Number is required");
      }
      return true;
    }),
  body("airport_type").optional().trim().notEmpty().withMessage("Airport Type is required"),
  body("extra").optional().isArray({ min: 1 }).withMessage("extra"),
  body("total_price").notEmpty().isNumeric().withMessage("Total Price is required"),
  body("booking_type")
    .notEmpty()
    .isIn(["PAY_NOW", "PAY_LATER"])
    .withMessage("Payment Type is required and can be " + ["PAY_NOW", "PAY_LATER"]),
  validateRequestBody,
];
