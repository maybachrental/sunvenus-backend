const { Op } = require("sequelize");
const { Bookings, sequelize, Transactions } = require("../models");
const { isCarAvailable, calculatePricingLogic } = require("../services/booking.service");
const { triptypeCondition } = require("../services/car.service");
const { createCheckoutSession, stripe } = require("../services/external/stripe.service");
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
      total_price,
      booking_type,
      addOn = [],
      destinations = null,
      discounts = [],
    } = req.body;

    const userId = req.user.id;
    const now = new Date();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    if (!pickup_location || !pickup_datetime || !trip_type) {
      throw new ErrorHandler(400, "All fields are required", validErrorName.BAD_REQUEST);
    }

    const pickupDateTime = new Date(pickup_datetime);
    const dropDateTime = triptypeCondition(trip_type, pickupDateTime, duration_hours, drop_datetime);

    // 1️ CHECK EXISTING RESERVATION
    let existing = await Bookings.findOne({
      where: {
        car_id,
        user_id: userId,
        booking_status: bookingStatus.PENDING_PAYMENT,
        created_at: { [Op.gt]: fifteenMinutesAgo },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existing) {
      const timePassed = Date.now() - new Date(existing.created_at).getTime();
      const timeLeft = 15 * 60 * 1000 - timePassed;

      if (existing.stripe_session_id) {
        const session = await stripe.checkout.sessions.retrieve(existing.stripe_session_id);

        if (session.status === "open" && timeLeft > 3 * 60 * 1000) {
          await transaction.commit();
          return responseHandler(res, 200, "Session Reused", {
            url: existing.checkout_url,
          });
        }

        // Expire old session if still open
        if (session.status === "open") {
          await stripe.checkout.sessions.expire(existing.stripe_session_id);
        }
      }

      // Mark as expired
      await existing.update({ booking_status: bookingStatus.CANCELLED,payment_status:paymentStatus.UNPAID }, { transaction });
    }

    // 2️ CHECK IF OTHER USER HAS RESERVED
    const available = await isCarAvailable(car_id, pickupDateTime, dropDateTime, transaction);
    if (!available) {
      throw new ErrorHandler(400, "Sorry! This Car has been reserved. Please select another car.");
    }

    // 3️ PRICE VALIDATION
    const estimated_price = await calculatePricingLogic(
      car_id,
      trip_type,
      duration_hours,
      included_km,
      addOn,
      destinations,
      pickup_datetime,
      drop_datetime,
      discounts,
    );

    if (estimated_price.total_price !== total_price) {
      throw new ErrorHandler(400, "Price mismatch. Reload page.");
    }

    // CREATE RESERVED BOOKING
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
        total_price: estimated_price.total_price,
        user_id: userId,
        booking_type,
        booking_status: booking_type === paymentToBe.PAY_LATER ? bookingStatus.CONFIRMED : bookingStatus.PENDING_PAYMENT,
        payment_status: paymentStatus.PENDING,
      },
      { transaction },
    );

    // PAY_LATER
    if (booking_type === paymentToBe.PAY_LATER) {
      await transaction.commit();
      return responseHandler(res, 201, "Booking Confirmed", { booking });
    }
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
    await transaction.commit(); // Commit BEFORE Stripe

    // 5️ CREATE STRIPE SESSION
    const stripeResponse = await createCheckoutSession({
      amount: estimated_price.total_price,
      booking_id: booking.id,
      user_id: req.user.id,
      booking_code: booking.booking_code,
      email: req.user.email,
      transaction_id: txn.id,
    });

    // Update booking with session
    await booking.update({
      stripe_session_id: stripeResponse.session.id,
      checkout_url: stripeResponse.url,
    });
    await txn.update({
      stripe_session_id: stripeResponse.session.id,
      status: "SESSION_CREATED",
      req_json: stripeResponse,
    });

    return responseHandler(res, 200, "Payment Initiated", {
      ...stripeResponse,
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
