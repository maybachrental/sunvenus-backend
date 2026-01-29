const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, tripType } = require("../utils/staticExport");

const validateRequestBody = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arrArr = errors.array();
    return next(new ErrorHandler(400, "Validation Error", validErrorName.VALIDATION_FAILED, arrArr));
  }
  next();
};

exports.validateCarAvailabilityBody = [
  body("pickup_location").trim().notEmpty().withMessage("Pickup location is required"),
  body("trip_type")
    .isArray({ min: 1 })
    .isIn([...tripType])
    .withMessage("Trip Type is required"),
  body("drop_location").trim().notEmpty().withMessage("Drop location is required"),
  body("pickup_date").notEmpty().withMessage("Pickup date is required").isISO8601().withMessage("Pickup date must be valid YYYY-MM-DD"),
  body("pickup_time")
    .notEmpty()
    .withMessage("Pickup time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Pickup time must be HH:mm"),
  body("drop_date").notEmpty().withMessage("Drop date is required").isISO8601().withMessage("Drop date must be valid YYYY-MM-DD"),
  body("drop_time")
    .notEmpty()
    .withMessage("Drop time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Drop time must be HH:mm"),
  body("duration_hours").optional().isInt({ min: 1, max: 72 }).withMessage("Duration hours must be between 1 and 72"),
  body("sort_by").optional().isIn(["newest", "oldest", "price_low", "price_high"]).withMessage("Invalid sort_by value"),
  // Custom date-time comparison
  body().custom((value, { req }) => {
    const pickup = new Date(`${req.body.pickup_date} ${req.body.pickup_time}`);
    const drop = new Date(`${req.body.drop_date} ${req.body.drop_time}`);
    if (pickup >= drop) {
      return next(new ErrorHandler(400, "Drop date/time must be after pickup date/time"));
    }
    return true;
  }),

  // Final error handler
  validateRequestBody,
];

exports.validateCreateBooking = [body("car_id").trim().notEmpty().withMessage("Pickup location is required"), validateRequestBody];
