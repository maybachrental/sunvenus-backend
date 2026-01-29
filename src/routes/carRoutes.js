const { fetchAllCars, checkCarAvailability } = require("../controllers/carController");
const { validateCarAvailabilityBody } = require("../validations/carValidator");

const router = require("express").Router();

router.get("/fetch-cars", fetchAllCars);

router.post("/check-availability", validateCarAvailabilityBody, checkCarAvailability);

module.exports = router;
