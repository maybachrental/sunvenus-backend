const { fetchDistanceMatrix } = require("../controllers/fetchController");

const router = require("express").Router();

router.post("/distance-between", fetchDistanceMatrix);

module.exports = router;
