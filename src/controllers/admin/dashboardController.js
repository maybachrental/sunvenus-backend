const { Users, Cars, Bookings, sequelize } = require("../../models");
const { userRole, paymentStatus, bookingStatus } = require("../../utils/staticExport");

const dashboardData = async (req, res, next) => {
  try {
    const totalUsers = await Users.count({
      where: { role: userRole.USER },
    });
    const totalCars = await Cars.count();
    const totalBookings = await Bookings.count();
    const totalRevenue = await Bookings.sum("total_price", {
      where: { payment_status: paymentStatus.PAID },
    });
    const confirmedBooking = await Bookings.count({
      where: { booking_status: bookingStatus.CONFIRMED },
    });
    const ongoingBooking = await Bookings.count({
      where: { booking_status: bookingStatus.ONGOING },
    });
    const completedBooking = await Bookings.count({
      where: { booking_status: bookingStatus.COMPLETED },
    });
    const cancelledBooking = await Bookings.count({
      where: { booking_status: bookingStatus.CANCELLED },
    });
    const topCars = await Bookings.findAll({
      attributes: [
        [sequelize.col("Car.name"), "name"],
        [sequelize.fn("COUNT", sequelize.col("Bookings.id")), "bookings"],
      ],
      include: [
        {
          model: Cars,
          attributes: [],
        },
      ],
      group: ["Car.id"],
      order: [[sequelize.literal("bookings"), "DESC"]],
      limit: 3,
      raw: true,
    });

    const recentBookings = await Bookings.findAll({
      attributes: ["id", "pickup_datetime", "booking_status"],
      where: { booking_status: bookingStatus.CONFIRMED },
      include: [
        {
          model: Users,
          attributes: ["name"],
        },
        {
          model: Cars,
          attributes: ["name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 5,
      raw: true,
      nest: true,
    });
    console.log(recentBookings);
    const parsedBookings = recentBookings.map((e) => {
      return {
        id: e?.id || "-",
        user: e?.User?.name || "-",
        car: e?.Car?.name || "-",
        pickupDate: e.pickup_datetime || "-",
        status: e?.booking_status || "-",
        statusColor: "primary",
      };
    });
    res.render("admin/dashboard", {
      stats: {
        totalBookings,
        totalRevenue, // payment table
        totalCars,
        totalUsers,
      },
      bookingStats: {
        confirmed: confirmedBooking,
        ongoing: ongoingBooking,
        completed: completedBooking,
        cancelled: cancelledBooking,
      },
      topCars,
      recentBookings: parsedBookings,
    });
  } catch (error) {}
};



module.exports = { dashboardData };
