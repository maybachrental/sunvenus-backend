const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (data) => {
  try {
    const { booking_id, amount, booking_code, user_id, email = null, transaction_id } = data;

    const createSession = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "INR",
            product_data: {
              name: `Car Rental Booking #${booking_code}`,
            },
            unit_amount: amount * 100, // INR → paise
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,

      metadata: {
        booking_code,
        booking_id,
        user_id,
        transaction_id,
      },
    };
    if (email) createSession.customer_email = email;

    const session = await stripe.checkout.sessions.create(createSession, {
      idempotencyKey: `booking_${booking_code}`,
    });

    return { success: true, url: session.url, session };
  } catch (err) {
    throw err;
  }
};


module.exports = { createCheckoutSession, stripe };
