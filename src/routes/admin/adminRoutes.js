const { upload } = require("../../config/multer");
const {
  showLoginPage,
  loginAdmin,
  logoutAdmin,
  showAdminRegisterPage,
  createAdmin,
  showAllBookings,
  showAllUsers,
  showAllCars,
} = require("../../controllers/admin/adminController");
const {
  listBlogs,
  createBlogPage,
  createBlog,
  blogJsonData,
  updateBlogPage,
  updateBlog,
  deleteBlog,
} = require("../../controllers/admin/blogController");
const { dashboardData, } = require("../../controllers/admin/dashboardController");
const { isAdminAuth, preventAdminLogin } = require("../../middlewares/adminAuth");

const MAX_SECTIONS = 20;
const sectionFields = Array.from({ length: MAX_SECTIONS }, (_, i) => ({
  name: `sections[${i}][image]`,
  maxCount: 1,
}));

const router = require("express").Router();

router.get("/create-admin", preventAdminLogin, showAdminRegisterPage);

router.post("/create-admin", preventAdminLogin, createAdmin);

router.get("/login", preventAdminLogin, showLoginPage);

router.post("/login", loginAdmin);

router.get("/logout", logoutAdmin);

router.use(isAdminAuth);

router.get("/dashboard", dashboardData);

router.get("/bookings", showAllBookings);

router.get("/users", showAllUsers);

router.get("/cars", showAllCars);

router.get("/blogs", listBlogs);

router.get("/blogs/create", createBlogPage);

router.post("/blogs/create", upload.fields([{ name: "hero_image", maxCount: 1 }, ...sectionFields]), createBlog);

router.get("/blogs/update", updateBlogPage);

router.get("/blogs/data/:id", blogJsonData);

router.put("/blogs/update/:id", upload.fields([{ name: "hero_image", maxCount: 1 }, ...sectionFields]), updateBlog);

router.get("/blogs/delete/:id", deleteBlog);

router.delete("/blogs/delete/:id", deleteBlog);

router.use((req, res, next) => {
  const referer = req.headers["referer"] || "/admin/dashboard"; // fallback if no referer
  return res.redirect(referer);
});
module.exports = router;
