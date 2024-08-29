import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { stripe } from "../config/stripeConfig.js";
import { User } from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";

export const createCustomer = catchAsyncError(async (req, res, next) => {
  try {
    const { email, payment_method } = req.body;

    const customer = await stripe.customers.create({
      email,
      payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    res.json({ customer });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

export const createSubscription = catchAsyncError(async (req, res, next) => {
  try {
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.json({ subscription });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

export const createSubscriptionSession = catchAsyncError(
  async (req, res, next) => {
    try {
      const { email, priceId } = req.body;

      // Create the checkout session with Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        shipping_address_collection: {
          allowed_countries: ["IN"],
        },
        success_url: "http://localhost:5173/subscriptions",
        cancel_url: "http://localhost:5173/subscriptions",
      });

      // Find the user in the database
      const user = await User.findOne({ email });

      // console.log(session);

      if (user) {
        // Update user's document with the subscription session ID
        user.subscriptionId = session.id; // Note: session.subscription may not exist, adjust based on your logic

        // Save the updated user document
        await user.save();
      }

      // Send the session URL to the frontend
      res.json({ sessionUrl: session.url });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
);

export const getSubscriptionDetails = catchAsyncError(
  async (req, res, next) => {
    try {
      const { subscriptionId } = req.params; // Retrieve subscriptionId from request parameters

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Send the subscription details back to the client
      res.json({ subscription });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
);

export const saveSubscription = catchAsyncError(async (req, res, next) => {
  try {
    const {
      userId,
      customerId,
      subscriptionId,
      plan,
      startDate,
      endDate,
      status,
      price,
    } = req.body;

    const subscription = await Subscription.create({
      userId,
      customerId,
      subscriptionId,
      plan,
      startDate,
      endDate,
      status,
      price,
    });

    res.status(201).json({ subscription });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});
