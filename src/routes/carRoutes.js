const { fetchAllCars, checkCarAvailability, fetchCarDetails } = require("../controllers/carController");
const { validateCarAvailabilityBody } = require("../validations/carValidator");

const router = require("express").Router();

router.get("/fetch-cars", fetchAllCars);

router.post("/check-availability", validateCarAvailabilityBody, checkCarAvailability);

router.get("/fetch-single/:id", fetchCarDetails);

module.exports = router;
