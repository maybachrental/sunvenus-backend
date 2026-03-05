const express = require("express");
const { authenicateUser } = require("../middlewares/authMiddleware");
const { getProfile, updateProfile, getUserBookings } = require("../controllers/userController");
const { upload } = require("../config/multer");
const router = express.Router();

router.get("/profile", authenicateUser, getProfile);

router.put("/profile", authenicateUser, upload.single("profile_image"), updateProfile);

router.get("/bookings", authenicateUser, getUserBookings);

module.exports = router;
