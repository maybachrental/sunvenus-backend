const { Users, Cars, Bookings } = require("../../models");
const { userRole } = require("../../utils/staticExport");

const dashboardData = async (req, res, next) => {
  try {
    const totalUsers = await Users.count({
      where: { role: userRole.USER },
    });
    const totalCars = await Cars.count();
    const totalBookings = await Bookings.count();

    res.render("admin/dashboard", {
      stats: {
        totalBookings,
        totalRevenue: "18,40,000", // payment table
        totalCars,
        totalUsers,
      },
      bookingStats: {
        upcoming: 18,
        ongoing: 6,
        completed: 92,
        cancelled: 8,
      },
      topCars: [
        { name: "BMW M5", bookings: 32 },
        { name: "Mercedes S-Class", bookings: 28 },
      ],
      recentBookings: [
        {
          id: 1021,
          user: "Rahul Sharma",
          car: "BMW M5",
          pickupDate: "02 Feb 2026",
          status: "Upcoming",
          statusColor: "primary",
        },
      ],
    });
  } catch (error) {}
};

const showAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { search = "", booking_status = "", payment_status = "" } = req.query;

    const bookingWhere = {};
    const carWhere = {};

    if (booking_status) {
      bookingWhere.booking_status = booking_status;
    }

    if (payment_status) {
      bookingWhere.payment_status = payment_status;
    }

    if (search) {
      carWhere.name = { [Op.like]: `%${search}%` };
    }

    const { rows: bookings, count } = await Bookings.findAndCountAll({
      // where: bookingWhere,
      // include: [
      //   {
      //     model: Cars,
      //     where: carWhere,
      //   },
      //   {
      //     model: Users,
      //   },
      // ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.render("admin/showBookings", {
      bookings,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { dashboardData, showAllBookings };
