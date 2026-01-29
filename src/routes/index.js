const router = require("express").Router();

router.get("/", (req, res) => res.send("Working"));

router.use("/auth", require("./authRoutes"));

router.use("/cars",require("./carRoutes"));

module.exports = router;
