const router = require("express").Router();

router.use("/auth", require("./authRoutes"));

router.use("/cars", require("./carRoutes"));

router.use("/user", require("./userRoutes"));

router.use("/booking", require("./bookingRoutes"));

router.use("/fetch", require("./fetchRoutes"));

router.use("/web", require("./webRoutes"));

module.exports = router;
