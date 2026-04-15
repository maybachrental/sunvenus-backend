const { upload } = require("../../config/multer");
const {
  showLoginPage,
  loginAdmin,
  logoutAdmin,
  showAdminRegisterPage,
  createAdmin,
  showAllBookings,
  showAllUsers,
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
const {
  showAllCars,
  createCarPage,
  createCar,
  uploadCarImages,
  deleteCar,
  getEditCarPage,
  updateCar,
  deleteCarImage,
  setCarImagePrimary,
  viewCarDetails,
  getContentPage,
  saveContent,
  getContentData,
} = require("../../controllers/admin/carController");
const { dashboardData } = require("../../controllers/admin/dashboardController");
const { promoPage, searchUsersForPromo, sendPromoMail } = require("../../controllers/admin/promoController");
const { isAdminAuth, preventAdminLogin } = require("../../middlewares/adminAuth");
const { fallback } = require("../../middlewares/adminMiddleware");

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

// blogs

router.get("/blogs", listBlogs);

router.get("/blogs/create", createBlogPage);

router.post("/blogs/create", upload.fields([{ name: "hero_image", maxCount: 1 }, ...sectionFields]), createBlog);

router.get("/blogs/update", updateBlogPage);

router.get("/blogs/data/:id", blogJsonData);

router.put("/blogs/update/:id", upload.fields([{ name: "hero_image", maxCount: 1 }, ...sectionFields]), updateBlog);

router.get("/blogs/delete/:id", deleteBlog);

router.delete("/blogs/delete/:id", deleteBlog);

// cars

router.get("/cars", showAllCars);

router.get("/add-car", createCarPage);

router.post("/add/cars", createCar);

router.post("/car/:id/images", upload.array("images", 20), uploadCarImages); //upload images/videos to Cloudinary

router.delete("/car/delete/:id", deleteCar);

// update routes
router.get("/car/:id/edit", getEditCarPage);
router.put("/update/cars/:id", updateCar);
router.delete("/update/cars/:id/images/:imageId", deleteCarImage);
router.patch("/update/cars/:id/images/:imageId/primary", setCarImagePrimary);

router.get("/car-details/:id", viewCarDetails);

// GET  /admin/car/:id/content       → render the editor page
router.get("/car/:id/content", getContentPage);

// POST /admin/car/:id/content       → upsert all sections at once
router.post("/car/:id/content", saveContent);

// GET  /admin/car/:id/content/data  → fetch existing content as JSON (for pre-fill)
router.get("/car/:id/content/data", getContentData);

// promotional mails and pages
router.get("/promo/emails", promoPage);

router.get("/promo/users/search", searchUsersForPromo);

router.post("/promo/promo-emails/send", sendPromoMail);

// this is the fallback handler
router.use(fallback);

module.exports = router;
