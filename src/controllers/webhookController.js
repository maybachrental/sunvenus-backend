const { handleSuccessfulPayment, handleFailedPayment } = require("../services/payment.service");
const ErrorHandler = require("../utils/ErrorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentSessionStatus = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (!event) {
      return next(new ErrorHandler(400, "Signature verification failed"));
    }
    switch (event.type) {
      // success
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;

        if (session.payment_status === "paid") {
          await handleSuccessfulPayment(session);
        } else {
          await handleFailedPayment(session);
        }
        break;
      }

      //  Payment failed
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        await handleFailedPayment(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { paymentSessionStatus };
