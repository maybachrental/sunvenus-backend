const { Bookings, Transactions, sequelize } = require("../models");
const { paymentStatus, bookingStatus } = require("../utils/staticExport");

const handleSuccessfulPayment = async (session) => {
  const booking_id = session.metadata.booking_id;
  const user_id = session.metadata.user_id;
  const stripe_session_id = session.id;

  if (!booking_id || !user_id) {
    console.error("Missing metadata in session");
    return;
  }

  await sequelize.transaction(async (transaction) => {
    // Lock booking row
    const booking = await Bookings.findOne({
      where: { id: booking_id, user_id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!booking) {
      console.error("Booking not found:", booking_id);
      return;
    }

    if (booking.payment_status === paymentStatus.PAID) {
      return; // already processed
    }

    await Promise.all([
      Bookings.update(
        {
          payment_status: paymentStatus.PAID,
          booking_status: bookingStatus.CONFIRMED,
        },
        {
          where: { id: booking_id, user_id },
          transaction,
        },
      ),

      Transactions.update(
        {
          res_json: session,
          payment_status: paymentStatus.SUCCESS,
          status:"SESSION_COMPLETED"
        },
        {
          where: {
            booking_id,
            stripe_session_id,
            user_id,
          },
          transaction,
        },
      ),
    ]);
    return;
  });
};

const handleFailedPayment = async (session) => {
  const booking_id = session.metadata.booking_id;
  const user_id = session.metadata.user_id;
  const stripe_session_id = session.id;

  if (!booking_id || !user_id) return;

  await sequelize.transaction(async (transaction) => {
    const booking = await Bookings.findOne({
      where: { id: booking_id, user_id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!booking) return;

    // If already confirmed, don't downgrade
    if (booking.booking_status === bookingStatus.CONFIRMED) {
      return;
    }

    await Promise.all([
      Bookings.update(
        {
          payment_status: paymentStatus.FAILED,
          booking_status: bookingStatus.CANCELLED,
        },
        {
          where: { id: booking_id, user_id },
          transaction,
        },
      ),

      Transactions.update(
        {
          res_json: session,
          payment_status: paymentStatus.FAILED,
          status: "SESSION_EXPIRED",
        },
        {
          where: {
            booking_id,
            user_id,
            stripe_session_id,
          },
          transaction,
        },
      ),
    ]);
  });
};

module.exports = { handleSuccessfulPayment, handleFailedPayment };
