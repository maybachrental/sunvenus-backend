const { checkAndCreateBooking, fetchUserBookings } = require("../controllers/bookingController");
const { authenicateUser } = require("../middlewares/authMiddleware");
const { verifyUser, verifyUserAndUpdatePhone } = require("../middlewares/verifyUser");
const { validateCarAvailabilityBody, validateCreateBooking } = require("../validations/carValidator");

const router = require("express").Router();

router.use(authenicateUser);

router.post("/create-booking", authenicateUser, validateCarAvailabilityBody, validateCreateBooking, verifyUserAndUpdatePhone, checkAndCreateBooking);

router.get("/user-bookings", authenicateUser, verifyUser, fetchUserBookings);

module.exports = router;
