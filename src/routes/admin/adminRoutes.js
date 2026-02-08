const { showLoginPage, loginAdmin, logoutAdmin, showAdminRegisterPage, createAdmin } = require("../../controllers/admin/adminController");
const { dashboardData, showAllBookings } = require("../../controllers/admin/dashboardController");
const { isAdminAuth, preventAdminLogin } = require("../../middlewares/adminAuth");
const router = require("express").Router();

router.get("/create-admin", preventAdminLogin, showAdminRegisterPage);

router.post("/create-admin", preventAdminLogin, createAdmin);

router.get("/login", preventAdminLogin, showLoginPage);

router.post("/login", loginAdmin);

router.get("/logout", logoutAdmin);

router.use(isAdminAuth);

router.get("/dashboard", dashboardData);

router.get("/bookings", showAllBookings);

router.use((req, res, next) => {
  const referer = req.headers["referer"] || "/admin/dashboard"; // fallback if no referer
  return res.redirect(referer);
});
module.exports = router;
