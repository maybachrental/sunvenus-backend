const express = require("express");
const { authenicateUser } = require("../middlewares/authMiddleware");
const { getProfile, updateProfile, updateProfileImage, getUserBookings } = require("../controllers/userController");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Get user profile
router.get("/profile", authenicateUser, getProfile);

// Update user profile
router.put("/profile", authenicateUser, updateProfile);

// Update profile image
router.put("/profile-image", authenicateUser, uploadMiddleware.single("profile_image"), updateProfileImage);

// Get user bookings
router.get("/bookings", authenicateUser, getUserBookings);

module.exports = router;
