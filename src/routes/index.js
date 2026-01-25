const router = require("express").Router();

router.get("/", (req, res) => res.send("Working"));

router.use("/auth", require("./authRoutes"));

module.exports = router;
