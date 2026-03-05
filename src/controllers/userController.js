const { Users, Bookings } = require("../models");
const CloudinaryService = require("../services/external/cloudinary.service");
const ErrorHandler = require("../utils/ErrorHandler");
const { responseHandler } = require("../utils/helper");
const { publicIdCreation } = require("../utils/slugify");
const { bookingStatus } = require("../utils/staticExport");

module.exports = {
  // GET /api/user/profile
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await Users.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return next(new ErrorHandler(404, "User not found"));
      }

      return responseHandler(res, 200, "User Data", { user });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/user/profile
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name } = req.body;

      const user = await Users.findByPk(userId);
      if (!user) {
        return next(new ErrorHandler(404, "User not found"));
      }
      let result = null;
      if (req.file) {
        const publicId = publicIdCreation(req.file, userId);
        result = await CloudinaryService.uploadFile(req.file, `sunvenus_backend/users/${userId}`, {
          useUUID: false,
          publicId,
        });
        if (user.public_image_id) {
          await CloudinaryService.delete(user.public_image_id);
        }
      }
      const body = {
        name: name ?? user.name,
      };
      if (result) {
        body.profile_image = result.secure_url;
        body.public_image_id = result.public_id;
      }
      await user.update(body);

      return responseHandler(res, 200, "Profile updated successfully", { user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // GET /api/user/bookings
  async getUserBookings(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new ErrorHandler(400, "User id not found", "ERROR"));
      }

      const { booking_status = bookingStatus.COMPLETED } = req.query;

      // Dynamic filters
      const where = { user_id: userId };

      if (booking_status) {
        where.booking_status = booking_status; // e.g. PENDING | CONFIRMED | CANCELLED
      }

      const bookings = await Bookings.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
      });

      return responseHandler(res, 200, "Your Bookings", { bookings });
    } catch (err) {
      next(err);
    }
  },
};
