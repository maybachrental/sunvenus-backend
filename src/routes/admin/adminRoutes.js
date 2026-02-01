const router = require("express").Router();

router.get("/dashboard", (req, res, next) => {
  res.render("admin/dashboard.ejs", { title: "yes" });
});

module.exports = router;
