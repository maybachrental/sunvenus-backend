const router = require("express").Router();

router.use("/auth", require("./authRoutes"));

router.use("/cars", require("./carRoutes"));

router.use("/booking", require("./bookingRoutes"));


module.exports = router;
