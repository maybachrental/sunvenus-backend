const { paymentSessionStatus } = require("../controllers/webhookController");

const router = require("express").Router();

router.post("/payment-session", paymentSessionStatus);

module.exports = router;
