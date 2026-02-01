const router = require("express").Router();


router.use("/auth", require("./authRoutes"));

router.use("/cars",require("./carRoutes"));

module.exports = router;
