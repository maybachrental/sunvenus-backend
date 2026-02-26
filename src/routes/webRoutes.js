const { submitContactForm } = require("../controllers/webController");

const router = require("express").Router();

router.post("/contact-form", submitContactForm);

module.exports = router;
