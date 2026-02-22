const { Bookings, sequelize, Transactions } = require("../models");
const { isCarAvailable, calculatePricingLogic } = require("../services/booking.service");
const { triptypeCondition } = require("../services/car.service");
const { createCheckoutSession } = require("../services/external/stripe.service");
const ErrorHandler = require("../utils/ErrorHandler");
const { responseHandler } = require("../utils/helper");
const { validErrorName, paymentToBe, bookingStatus, paymentStatus } = require("../utils/staticExport");

const checkAndCreateBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      car_id,
      pickup_location,
      drop_location,
      pickup_datetime,
      drop_datetime,
      trip_type,
      duration_hours,
      included_km,
      extra = [],
      total_price,
      booking_type,
    } = req.body;

    if (!pickup_location || !pickup_datetime || !trip_type) {
      throw new ErrorHandler(400, "All fields are required", validErrorName.INVALID_REQUEST);
    }

    const pickupDateTime = new Date(pickup_datetime);
    const dropDateTime = triptypeCondition(trip_type, pickupDateTime, duration_hours, drop_datetime);

    // IMPORTANT: Lock rows to prevent race condition
    const available = await isCarAvailable(car_id, pickupDateTime, dropDateTime, transaction);

    if (!available) {
      throw new ErrorHandler(400, "Car is no longer available.", validErrorName.CAR_ALREADY_BOOKED);
    }

    const estimated_price = await calculatePricingLogic(car_id, trip_type, duration_hours, included_km, extra);

    if (estimated_price.total_price !== total_price) {
      throw new ErrorHandler(400, "Price mismatch. Reload page.");
    }

    const booking = await Bookings.create(
      {
        car_id,
        pickup_datetime: pickupDateTime,
        drop_datetime: dropDateTime,
        drop_location,
        pickup_location,
        trip_type,
        booking_hours: duration_hours,
        included_km,
        base_price: estimated_price.base_price,
        extra_hour_price: estimated_price.extra_hour_price,
        extra_km_price: estimated_price.extra_km_price,
        total_price: estimated_price.total_price,
        user_id: req.user.id,
        booking_type,
        booking_status: booking_type === paymentToBe.PAY_LATER ? bookingStatus.CONFIRMED : bookingStatus.PENDING_PAYMENT,
        payment_status: paymentStatus.PENDING,
      },
      { transaction },
    );

    // PAY_LATER flow

    if (booking_type === paymentToBe.PAY_LATER) {
      await transaction.commit();

      return responseHandler(res, 201, "Booking Confirmed", { booking });
    }

    // PAY_NOW flow

    const txn = await Transactions.create(
      {
        currency: "INR",
        amount: estimated_price.total_price,
        payment_method: "card",
        booking_id: booking.id,
        user_id: req.user.id,
        status: "INITIATED",
      },
      { transaction },
    );

    await transaction.commit(); // ✅ Commit DB FIRST

    // Now call Stripe OUTSIDE transaction

    const stripeResponse = await createCheckoutSession({
      amount: estimated_price.total_price,
      booking_id: booking.id,
      user_id: req.user.id,
      booking_code: booking.booking_code,
      email: req.user.email,
      transaction_id: txn.id,
    });

    if (!stripeResponse.success) {
      // Mark booking failed instead of rollback
      await booking.update({
        booking_status: bookingStatus.CANCELLED,
        payment_status: paymentStatus.FAILED,
      });

      throw new ErrorHandler(400, "Payment initialization failed. Please Try Again");
    }

    // Update transaction with stripe session
    await txn.update({
      stripe_session_id: stripeResponse.session.id,
      status: "SESSION_CREATED",
      req_json: stripeResponse,
    });

    return responseHandler(res, 200, "Payment Initiated", {
      id: stripeResponse.session.id,
      url: stripeResponse.url,
    });
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(err);
  }
};

const fetchUserBookings = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const fetchBookings = await Bookings.findAll({
      where: { user_id },
    });
    responseHandler(res, 200, "User Bookings", fetchBookings);
  } catch (error) {
    next(error);
  }
};

//  node cron , and webhook manage the pending payment state and also the send user and admin confirmations for bookings created

module.exports = { checkAndCreateBooking, fetchUserBookings };
