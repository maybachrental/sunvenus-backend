const { Op } = require("sequelize");
const { Bookings, sequelize, Transactions, BookingAddOns } = require("../models");
const { isCarAvailable, calculatePricingLogic } = require("../services/booking.service");
const { triptypeCondition } = require("../services/car.service");
const { createCheckoutSession, stripe } = require("../services/external/stripe.service");
const ErrorHandler = require("../utils/ErrorHandler");
const { responseHandler } = require("../utils/helper");
const { validErrorName, paymentToBe, bookingStatus, paymentStatus } = require("../utils/staticExport");

// const checkAndCreateBooking = async (req, res, next) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const {
//       car_id,
//       pickup_location,
//       drop_location,
//       pickup_datetime,
//       drop_datetime,
//       trip_type,
//       duration_hours,
//       included_km,
//       total_price,
//       booking_type,
//       addOn = [],
//       destinations = null,
//       discounts = [],
//       full_drop_address = null,
//       full_pick_address = null,
//       special_instruction = null,
//     } = req.body;

//     const userId = req.user.id;
//     const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

//     if (!pickup_location || !pickup_datetime || !trip_type) {
//       throw new ErrorHandler(400, "All fields are required", validErrorName.BAD_REQUEST);
//     }

//     // Extract discount_id safely from array (take first object's id)
//     const discount_id = Array.isArray(discounts) && discounts.length > 0 ? (discounts[0]?.id ?? null) : null;

//     const pickupDateTime = new Date(pickup_datetime);
//     const dropDateTime = triptypeCondition(trip_type, pickupDateTime, duration_hours, drop_datetime);

//     // ─────────────────────────────────────────────────────────────
//     // STEP 1 — ALWAYS validate price server-side first (before anything else)
//     // This is the source of truth — client price is never trusted
//     // ─────────────────────────────────────────────────────────────
//     const estimated_price = await calculatePricingLogic(
//       car_id,
//       trip_type,
//       duration_hours,
//       included_km,
//       addOn,
//       destinations,
//       pickup_datetime,
//       drop_datetime,
//       discounts,
//     );

//     if (estimated_price.total_price !== total_price) {
//       throw new ErrorHandler(400, "Price mismatch. Please reload and try again.");
//     }

//     // ─────────────────────────────────────────────────────────────
//     // STEP 2 — CHECK EXISTING PENDING RESERVATION FOR THIS USER+CAR
//     // ─────────────────────────────────────────────────────────────
//     const existing = await Bookings.findOne({
//       where: {
//         car_id,
//         user_id: userId,
//         booking_status: bookingStatus.PENDING_PAYMENT,
//         created_at: { [Op.gt]: fifteenMinutesAgo },
//       },
//       transaction,
//       lock: transaction.LOCK.UPDATE,
//     });

//     if (existing) {
//       const timePassed = Date.now() - new Date(existing.created_at).getTime();
//       const timeLeft = 15 * 60 * 1000 - timePassed;

//       // Re-validate price against the existing booking — addOns or price may have changed
//       const priceChanged = existing.total_price !== estimated_price.total_price;

//       if (!priceChanged && existing.stripe_session_id) {
//         // Price is same — try to reuse the Stripe session
//         const session = await stripe.checkout.sessions.retrieve(existing.stripe_session_id);

//         if (session.status === "open" && timeLeft > 3 * 60 * 1000) {
//           // Session still valid and enough time left — reuse it
//           await transaction.commit();
//           return responseHandler(res, 200, "Session Reused", {
//             url: existing.checkout_url,
//           });
//         }

//         // Session expired or too close to timeout — expire it if still open
//         if (session.status === "open") {
//           await stripe.checkout.sessions.expire(existing.stripe_session_id);
//         }
//       }

//       // Price changed OR session not reusable — cancel old booking and start fresh
//       await existing.update(
//         {
//           booking_status: bookingStatus.CANCELLED,
//           payment_status: paymentStatus.UNPAID,
//         },
//         { transaction },
//       );
//     }

//     // ─────────────────────────────────────────────────────────────
//     // STEP 3 — CHECK CAR AVAILABILITY AGAINST OTHER USERS
//     // ─────────────────────────────────────────────────────────────
//     const available = await isCarAvailable(car_id, pickupDateTime, dropDateTime, transaction);
//     if (!available) {
//       throw new ErrorHandler(400, "Sorry! This car has been reserved. Please select another car.");
//     }

//     // ─────────────────────────────────────────────────────────────
//     // STEP 4 — CREATE BOOKING RECORD
//     // ─────────────────────────────────────────────────────────────
//     const booking = await Bookings.create(
//       {
//         car_id,
//         pickup_datetime: pickupDateTime,
//         drop_datetime: dropDateTime,
//         drop_location,
//         pickup_location,
//         trip_type,
//         booking_hours: duration_hours,
//         included_km,
//         base_price: estimated_price.base_price,
//         total_price: estimated_price.total_price,
//         user_id: userId,
//         booking_type,
//         booking_status: booking_type === paymentToBe.PAY_LATER ? bookingStatus.CONFIRMED : bookingStatus.PENDING_PAYMENT,
//         payment_status: paymentStatus.PENDING,
//         full_drop_address,
//         full_pick_address,
//         special_instruction,
//         discount_id, // single discount id extracted from array
//       },
//       { transaction },
//     );

//     // ─────────────────────────────────────────────────────────────
//     // STEP 5 — SAVE ADD-ONS TO SEPARATE TABLE
//     // Each addOn object must have an `id` referencing the AddOns master table
//     // ─────────────────────────────────────────────────────────────
//     if (addOn.length > 0) {
//       const bookingAddOns = addOn.map((addon) => ({
//         booking_id: booking.id,
//         add_on_id: addon.id, // ref to master add-ons table
//       }));

//       await BookingAddOns.bulkCreate(bookingAddOns, { transaction });
//     }

//     // ─────────────────────────────────────────────────────────────
//     // STEP 6 — PAY LATER: commit and return early
//     // ─────────────────────────────────────────────────────────────
//     if (booking_type === paymentToBe.PAY_LATER) {
//       await transaction.commit();
//       return responseHandler(res, 201, "Booking Confirmed", { booking });
//     }

//     // ─────────────────────────────────────────────────────────────
//     // STEP 7 — ONLINE PAYMENT: create transaction record + Stripe session
//     // ─────────────────────────────────────────────────────────────
//     const txn = await Transactions.create(
//       {
//         currency: "INR",
//         amount: estimated_price.total_price,
//         payment_method: "card",
//         booking_id: booking.id,
//         user_id: req.user.id,
//         status: "INITIATED",
//       },
//       { transaction },
//     );

//     await transaction.commit(); // Commit BEFORE calling Stripe

//     const stripeResponse = await createCheckoutSession({
//       amount: estimated_price.total_price,
//       booking_id: booking.id,
//       user_id: req.user.id,
//       booking_code: booking.booking_code,
//       email: req.user.email,
//       transaction_id: txn.id,
//     });

//     await booking.update({
//       stripe_session_id: stripeResponse.session.id,
//       checkout_url: stripeResponse.url,
//     });

//     await txn.update({
//       stripe_session_id: stripeResponse.session.id,
//       status: "SESSION_CREATED",
//       req_json: stripeResponse,
//     });

//     return responseHandler(res, 200, "Payment Initiated", { ...stripeResponse });
//   } catch (err) {
//     if (!transaction.finished) {
//       await transaction.rollback();
//     }
//     next(err);
//   }
// };

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
      full_drop_address = null,
      full_pick_address = null,
      special_instruction = null,
    } = req.body;

    const userId = req.user.id;
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    if (!pickup_location || !pickup_datetime || !trip_type) {
      throw new ErrorHandler(400, "All fields are required", validErrorName.BAD_REQUEST);
    }

    // Extract discount_id safely from array (take first object's id)
    const discount_id = Array.isArray(discounts) && discounts.length > 0 ? (discounts[0]?.id ?? null) : null;

    const pickupDateTime = new Date(pickup_datetime);
    const dropDateTime = triptypeCondition(trip_type, pickupDateTime, duration_hours, drop_datetime);

    // ─────────────────────────────────────────────────────────────
    // STEP 1 — SERVER-SIDE PRICE VALIDATION (source of truth)
    // Client-sent total_price is never trusted
    // ─────────────────────────────────────────────────────────────
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
      throw new ErrorHandler(400, "Price mismatch. Please reload and try again.");
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2 — DELETE EXISTING PENDING BOOKING FOR THIS USER+CAR
    // If one exists within the last 15 mins:
    //   → expire its Stripe session (if open)
    //   → delete its add-ons
    //   → delete the booking itself
    // ─────────────────────────────────────────────────────────────
    const existing = await Bookings.findOne({
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
      // Expire Stripe session if still open
      if (existing.stripe_session_id) {
        try {
          const session = await stripe.checkout.sessions.retrieve(existing.stripe_session_id);
          if (session.status === "open") {
            await stripe.checkout.sessions.expire(existing.stripe_session_id);
          }
        } catch (_) {
          // Already expired/invalid on Stripe's end — safe to ignore
        }
      }

      // Delete add-ons tied to this booking first (FK constraint)
      await BookingAddOns.destroy({
        where: { booking_id: existing.id },
        transaction,
      });

      // Delete the booking itself
      await existing.destroy({ transaction });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3 — CAR AVAILABILITY CHECK AGAINST OTHER USERS
    // ─────────────────────────────────────────────────────────────
    const available = await isCarAvailable(car_id, pickupDateTime, dropDateTime, transaction);
    if (!available) {
      throw new ErrorHandler(400, "Sorry! This car has been reserved. Please select another car.");
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 4 — CREATE NEW BOOKING RECORD
    // ─────────────────────────────────────────────────────────────
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
        full_drop_address,
        full_pick_address,
        special_instruction,
        discount_id,
      },
      { transaction },
    );

    // ─────────────────────────────────────────────────────────────
    // STEP 5 — SAVE ADD-ONS TO SEPARATE TABLE
    // ─────────────────────────────────────────────────────────────
    if (addOn.length > 0) {
      const bookingAddOns = addOn.map((addon) => ({
        booking_id: booking.id,
        add_on_id: addon.id,
      }));

      await BookingAddOns.bulkCreate(bookingAddOns, { transaction });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 6 — PAY LATER: commit and return confirmed booking
    // ─────────────────────────────────────────────────────────────
    if (booking_type === paymentToBe.PAY_LATER) {
      await transaction.commit();
      return responseHandler(res, 201, "Booking Confirmed", { booking });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 7 — PAY NOW: create transaction record then Stripe session
    // Commit BEFORE calling Stripe (external call must be outside txn)
    // ─────────────────────────────────────────────────────────────
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

    await transaction.commit(); // Commit BEFORE calling Stripe

    const stripeResponse = await createCheckoutSession({
      amount: estimated_price.total_price,
      booking_id: booking.id,
      user_id: req.user.id,
      booking_code: booking.booking_code,
      email: req.user.email,
      transaction_id: txn.id,
    });

    await booking.update({
      stripe_session_id: stripeResponse.session.id,
      checkout_url: stripeResponse.url,
    });

    await txn.update({
      stripe_session_id: stripeResponse.session.id,
      status: "SESSION_CREATED",
      req_json: stripeResponse,
    });

    return responseHandler(res, 200, "Payment Initiated", { ...stripeResponse });
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
