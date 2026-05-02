const { Users, Bookings, BookingAddOns, Discounts, AddOns } = require("../models");
const CloudinaryService = require("../services/external/cloudinary.service");
const ErrorHandler = require("../utils/ErrorHandler");
const { responseHandler, getPagination } = require("../utils/helper");
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
      const { name, phone } = req.body;

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
        phone: phone ?? user.phone,
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

      const { limit, page, offset } = getPagination(req.query.page || 1, 5);
      const { booking_status } = req.query;

      const where = { user_id: userId };

      if (booking_status) {
        where.booking_status = booking_status;
      }

      const bookings = await Bookings.findAndCountAll({
        where,
        include: [
          {
            model: BookingAddOns,
            attributes: ["id"],
            include: [
              {
                model: AddOns,
                attributes: ["id", "type", "price", "duration", "extra"],
              },
            ],
          },
          {
            model: Discounts,
            attributes: ["id", "code", "type", "value", "expiry_date"],
            required: false,
          },
        ],
        offset,
        limit,
        order: [["created_at", "DESC"]],
      });

      // Transform data
      const formattedBookings = bookings.rows.map((booking) => {
        const data = booking.toJSON();

        // Flatten AddOns safely
        data.BookingAddOns = (data.BookingAddOns || []).map((item) => ({
          id: item.id,
          ...(item.AddOn || {}), // prevent crash if AddOn missing
        }));

        // Apply Discount safely
        let discount_price = 0;

        if (data.Discount) {
          if (data.Discount.type === "PERCENTAGE") {
            discount_price = (parseFloat(data.base_price || 0) * data.Discount.value) / 100;
          } else if (data.Discount.type === "FLAT") {
            discount_price = parseFloat(data.Discount.value || 0);
          }
        }

        data.discount_price = discount_price;

        return data;
      });

      return responseHandler(res, 200, "Your Bookings", {
        bookings: formattedBookings,
        currentPage: page,
        totalPages: Math.ceil(bookings.count / limit),
        totalBookings: bookings.count,
      });
    } catch (err) {
      next(err);
    }
  },
};
