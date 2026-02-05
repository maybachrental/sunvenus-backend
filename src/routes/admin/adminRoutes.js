const router = require("express").Router();

router.get("/dashboard", (req, res, next) => {
  res.render("admin/dashboard", {
    stats: {
      totalBookings: 124,
      totalRevenue: "18,40,000",
      totalCars: 22,
      totalUsers: 310,
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
  
});

module.exports = router;
