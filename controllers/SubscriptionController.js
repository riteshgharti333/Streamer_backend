import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { stripe } from "../config/stripeConfig.js";
import Subscription from "../models/subscriptionModel.js";

// CREATE CUSTOMER

export const createCustomer = catchAsyncError(async (req, res, next) => {
  try {
    const { email, payment_method, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
      metadata: {
        userId: req.body.userId,
      },
    });

    res.json({ customer });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// GET CUSTOMER

export const getCustomer = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    const customer = await stripe.customers.retrieve(id);

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer from Stripe:", error);
    if (error.type === "StripeInvalidRequestError") {
      res.status(400).json({ error: "Invalid customer ID" });
    } else {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  }
});

// CREATE SUBSCRIPTION  SESSION

export const createSubscriptionSession = catchAsyncError(
  async (req, res, next) => {
    try {
      const { email, priceId, userId, name } = req.body;
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
        metadata: {
          userId,
          name,
        },
      });

      res.json({ sessionUrl: session.url });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
);

// GET SUBSCRIPTION DATA

export const getSubscriptionData = catchAsyncError(async (req, res, next) => {
  try {
    const subscriptionData = await Subscription.find();

    res.status(200).json({
      success: true,
      subscriptionData,
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: { message: error.message } });
  }
});

// GET STRIPE SUBSCRIPTION

export const getSubscriptionDetails = catchAsyncError(
  async (req, res, next) => {
    try {
      const { subscriptionId } = req.params;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      res.json({ subscription });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
);

// GET ALL SUBSCRIPTIONS

export const fetchAllSubscriptions = catchAsyncError(async (req, res, next) => {
  try {
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });

    const subscriptionCount = subscriptions.data.length;

    res.status(200).json({
      count: subscriptionCount,
      subscriptions: subscriptions.data,
    });
  } catch (error) {
    console.log(error);
    console.error("Error fetching subscriptions from Stripe:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// DELETE ALL SUBSCRIPTIONS

export const deleteAllSubscriptions = catchAsyncError(
  async (req, res, next) => {
    try {
      // Fetch all subscriptions with a limit of 100 initially.
      let subscriptions = await stripe.subscriptions.list({ limit: 100 });
      let allSubscriptions = subscriptions.data;

      // Check if there are more than 100 subscriptions, and fetch them in subsequent calls.
      while (subscriptions.has_more) {
        subscriptions = await stripe.subscriptions.list({
          limit: 100,
          starting_after: subscriptions.data[subscriptions.data.length - 1].id,
        });
        allSubscriptions = allSubscriptions.concat(subscriptions.data);
      }

      // Iterate over each subscription and cancel them.
      for (const subscription of allSubscriptions) {
        await stripe.subscriptions.cancel(subscription.id);
      }

      res
        .status(200)
        .json({ message: "All subscriptions have been canceled." });
    } catch (error) {
      console.error("Error deleting all subscriptions:", error);
      res.status(500).json({ error: "Failed to delete all subscriptions" });
    }
  }
);

// DELETE SUBSCRIPTION

export const deleteSubscription = catchAsyncError(async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await Subscription.findOneAndDelete({
      subscriptionId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    await stripe.subscriptions.cancel(subscription.subscriptionId);

    // Delete the subscription from MongoDB
    await Subscription.findOneAndDelete({ subscriptionId });

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
