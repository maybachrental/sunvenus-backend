const { fetchAllCars, checkCarAvailability, fetchCarDetails, fetchSingleCarForBooking, fetchEstimatePrice } = require("../controllers/carController");
const { validateCarAvailabilityBody } = require("../validations/carValidator");

const router = require("express").Router();

router.get("/fetch-cars", fetchAllCars);

router.post("/check-availability", validateCarAvailabilityBody, checkCarAvailability);

router.get("/fetch-single/:id", fetchCarDetails);

router.get("/fetch-car/:id/book", fetchSingleCarForBooking);

router.post("/estimate-price", fetchEstimatePrice);

module.exports = router;
