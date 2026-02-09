const {
  fetchAllCars,
  checkCarAvailability,
  fetchCarDetails,
  fetchSingleCarForBooking,
  fetchEstimatePrice,
  fetchAllBrands,
} = require("../controllers/carController");
const { validateCarAvailabilityBody } = require("../validations/carValidator");

const router = require("express").Router();

router.get("/fetch-cars", fetchAllCars);

router.get("/fetch-brands", fetchAllBrands);

router.post("/check-availability", validateCarAvailabilityBody, checkCarAvailability);

router.get("/fetch-single/:id", fetchCarDetails);

router.get("/fetch-car/:id/book", fetchSingleCarForBooking);

router.post("/estimate-price", fetchEstimatePrice);

module.exports = router;
