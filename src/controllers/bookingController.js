const { Bookings } = require("../models");
const { isCarAvailable } = require("../services/booking.service");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName } = require("../utils/staticExport");

const checkAndCreateBooking = async (req, res, next) => {
  try {
    const { car_id, pickup_location, drop_location, pickup_date, pickup_time, drop_date, drop_time } = req.body;
    const pickupDateTime = new Date(`${pickup_date} ${pickup_time}`);
    const dropDateTime = new Date(`${drop_date} ${drop_time}`);
    const available = await isCarAvailable(car_id, pickupDateTime, dropDateTime);
    if (!available) {
      return next(
        new ErrorHandler(400, "Oops! You are late, Car is no longer available. Please select another Car.", validErrorName.CAR_ALREADY_BOOKED),
      );
    }
    // const booking = await Bookings.create({
    //   car_id,
    //   pickup_datetime,
    //   drop_datetime,
    //   booking_status: "CONFIRMED",
    // });
    responseHandler(res, 201, "Booking created", booking);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkAndCreateBooking };
