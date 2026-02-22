const { checkAndCreateBooking, fetchUserBookings } = require("../controllers/bookingController");
const { authenicateUser } = require("../middlewares/authMiddleware");
const { verifyUser } = require("../middlewares/verifyUser");
const { validateCarAvailabilityBody, validateCreateBooking } = require("../validations/carValidator");

const router = require("express").Router();

router.use(authenicateUser);

router.post("/create-booking", authenicateUser, validateCarAvailabilityBody, validateCreateBooking, verifyUser, checkAndCreateBooking);

router.get("/user-bookings", authenicateUser, verifyUser, fetchUserBookings);

module.exports = router;
