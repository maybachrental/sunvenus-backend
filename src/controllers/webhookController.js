const { razorpay } = require("../config/razorpay");
const { handleSuccessfulPayment, handleFailedPayment, handleSuccessfulPaymentRXR, handleFailedPaymentRZR } = require("../services/payment.service");
const ErrorHandler = require("../utils/ErrorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");

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

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new ErrorHandler(400, "Missing payment verification fields"));
    }

    // Step 1 — Verify HMAC signature (same concept as Stripe webhook signature)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new ErrorHandler(400, "Payment signature verification failed"));
    }

    // Step 2 — Fetch order notes from Razorpay (has booking_id, user_id)
    // Same as reading session.metadata in Stripe
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const { booking_id, user_id } = order.notes;

    // Step 3 — Mark booking + transaction as paid (calls your unchanged service)
    await handleSuccessfulPaymentRXR({
      booking_id,
      user_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// ROUTE 2: /payment-webhook
// Called by RAZORPAY SERVER for async events (failed, refunded)
// Add this URL in Razorpay Dashboard → Webhooks
const paymentWebhook = async (req, res, next) => {
  try {
    // Step 1 — Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(req.body)).digest("hex");

    if (expectedSignature !== signature) {
      return next(new ErrorHandler(400, "Webhook signature verification failed"));
    }

    const event = req.body;
    const eventType = event.event;
    console.log(eventType);

    switch (eventType) {
      // Replaces: checkout.session.completed
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const order = await razorpay.orders.fetch(payment.order_id);
        const { booking_id, user_id } = order.notes;

        await handleSuccessfulPaymentRXR({
          booking_id,
          user_id,
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
        });
        break;
      }

      // Replaces: checkout.session.expired + async_payment_failed
      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const order = await razorpay.orders.fetch(payment.order_id);
        const { booking_id, user_id } = order.notes;

        await handleFailedPaymentRZR({
          booking_id,
          user_id,
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
        });
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    // Always return 200 to Razorpay or it will keep retrying
    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { paymentSessionStatus, verifyPayment, paymentWebhook };
