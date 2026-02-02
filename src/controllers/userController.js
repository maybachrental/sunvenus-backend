const { Users, Bookings } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const { responseHandler } = require("../utils/helper");

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
      const { name, phone, email } = req.body;

      const user = await Users.findByPk(userId);
      if (!user) {
        return next(new ErrorHandler(404, "User not found"));
      }

      await user.update({
        name: name ?? user.name,
        phone: phone ?? user.phone,
        email: email ?? user.email,
      });

      return responseHandler(res, 200, "Profile updated successfully", { user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // PUT /api/user/profile-image
  //   async updateProfileImage(req, res) {
  //     try {
  //       if (!req.file) {
  //         return res.status(400).json({ message: "Image is required" });
  //       }

  //       /**
  //        * req.file contains:
  //        * - buffer (image binary)
  //        * - mimetype
  //        * - originalname
  //        * - size
  //        */

  //       // Example: store image buffer in DB (BLOB)
  //       const user = await Users.findByPk(req.user.id);
  //       if (!user) return res.status(404).json({ message: "User not found" });

  //       await user.update({
  //         profile_image: req.file.buffer,
  //         profile_image_type: req.file.mimetype,
  //       });

  //       res.json({ message: "Profile image updated successfully" });
  //     } catch (err) {
  //       res.status(500).json({ message: "Server error" });
  //     }
  //   },

  // GET /api/user/bookings
  async getUserBookings(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new ErrorHandler(400, "User id not found", "ERROR"));
      }

      const { status, from_date, to_date } = req.query;

      // Dynamic filters
      const where = { user_id: userId };

      if (status) {
        where.status = status; // e.g. PENDING | CONFIRMED | CANCELLED
      }

      if (from_date || to_date) {
        where.pickup_date = {};
        if (from_date) where.pickup_date.$gte = new Date(from_date);
        if (to_date) where.pickup_date.$lte = new Date(to_date);
      }

      const bookings = await Bookings.findAll({
        where,
        order: [["created_at", "DESC"]],
      });

      return responseHandler(res, 200, "Your Bookings", { bookings });
    } catch (err) {
      next(err);
    }
  },
};
