const {
  fetchAllCars,
  checkCarAvailability,
  fetchCarDetails,
  fetchSingleCarForBooking,
  fetchEstimatePrice,
  fetchAllBrands,
  fetchPremiumCars,
} = require("../controllers/carController");
const { validateCarAvailabilityBody, validateSelectedCarData } = require("../validations/carValidator");

const router = require("express").Router();

router.get("/fetch-cars", fetchAllCars);

router.get("/fetch-premium-cars", fetchPremiumCars);

router.get("/fetch-brands", fetchAllBrands);

router.post("/check-availability", validateCarAvailabilityBody, checkCarAvailability);

router.get("/fetch-single/:id", fetchCarDetails);

router.get("/fetch-car/:car_id/book", validateSelectedCarData, fetchSingleCarForBooking);

router.post("/estimate-price", fetchEstimatePrice);

module.exports = router;
