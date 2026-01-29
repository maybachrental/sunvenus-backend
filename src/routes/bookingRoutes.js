const { checkAndCreateBooking } = require("../controllers/bookingController");
const { authenicateUser } = require("../middlewares/authMiddleware");
const { verifyUser } = require("../middlewares/verifyUser");
const { validateCarAvailabilityBody } = require("../validations/carValidator");

const router = require("express").Router();

router.use(authenicateUser);

router.post("/create-booking", validateCarAvailabilityBody, validateCreateBooking, verifyUser, checkAndCreateBooking);

module.exports = router;
