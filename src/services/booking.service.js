const { Op } = require("sequelize");
const { Bookings } = require("../models");

const isCarAvailable = async (car_id, pickupDateTime, dropDateTime) => {
  const existingBooking = await Bookings.findOne({
    where: {
      car_id,
      booking_status: { [Op.in]: ["CONFIRMED", "ONGOING", "PENDING_PAYMENT"] },
      pickup_datetime: { [Op.lt]: dropDateTime },
      drop_datetime: { [Op.gt]: pickupDateTime },
    },
  });

  return !existingBooking; // true if available
};

module.exports = { isCarAvailable };
