const cron = require("node-cron");
const { Op } = require("sequelize");
const { Bookings, Transactions } = require("../models");
const RESERVATION_WINDOW = 15 * 60 * 1000; // 15 minutes
const { stripe } = require("../services/external/stripe.service");
const { bookingStatus, paymentStatus } = require("../utils/staticExport");

const startPendingBookingCleanup = () => {
  // Runs every minute
  cron.schedule("*/2 * * * *", async () => {
    try {
      console.log("Checking expired pending bookings...");
      const fifteenMinutesAgo = new Date(Date.now() - RESERVATION_WINDOW);
      const expiredBookings = await Bookings.findAll({
        where: {
          booking_status: bookingStatus.PENDING_PAYMENT,
          created_at: { [Op.lt]: fifteenMinutesAgo },
        },
      });

      if (!expiredBookings.length) return;

      for (const booking of expiredBookings) {
        console.log(`Cancelling booking ID: ${booking.id}`);
        // 1️ Expire Stripe session if exists
        if (booking.stripe_session_id) {
          try {
            const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);

            if (session.status === "open") {
              await stripe.checkout.sessions.expire(booking.stripe_session_id);
            }
          } catch (err) {
            console.error(`Stripe session expire failed for booking ${booking.id}`, err.message);
          }
        }

        // 2️ Update booking
        await booking.update({
          booking_status: bookingStatus.CANCELLED,
          payment_status: paymentStatus.FAILED,
        });

        // // 3️ Update related transaction
        // await Transactions.update(
        //   { status: paymentStatus.EXPIRED },
        //   {
        //     where: {
        //       booking_id: booking.id,
        //       status: { [Op.notIn]: ["SUCCESS"] },
        //     },
        //   },
        // );
      }

      console.log(`✅ Cancelled ${expiredBookings.length} expired bookings`);
    } catch (error) {
      console.error("❌ Cron Job Error:", error);
    }
  });
};

module.exports = startPendingBookingCleanup;
