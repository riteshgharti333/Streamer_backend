import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { stripe } from "../config/stripeConfig.js";
import Subscription from "../models/subscriptionModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// CREATE CUSTOMER

export const createCustomer = catchAsyncError(async (req, res) => {
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
      return next(new ErrorHandler("Invalid customer ID", 400));
    }

    return next(new ErrorHandler("Failed to fetch customer", 500));
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
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        metadata: {
          userId,
          name,
        },
      });

      res.json({ sessionUrl: session.url });
    } catch (error) {
      next(new ErrorHandler(error.message, 400)); // Pass error to next middleware
    }
  },
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
    next(new ErrorHandler(error.message, 400));
  }
});

// GET STRIPE SUBSCRIPTION
export const getSubscriptionDetails = catchAsyncError(
  async (req, res, next) => {
    try {
      const subscription = await Subscription.findById(req.params.id);

      if (!subscription) {
        return next(new ErrorHandler("Subscription not found", 404));
      }

      res.status(200).json({
        success: true,
        subscription,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },
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
    next(new ErrorHandler("Failed to fetch subscriptions", 500));
  }
});

// DELETE ALL SUBSCRIPTIONS

export const deleteAllSubscriptions = catchAsyncError(
  async (req, res, next) => {
    try {
      let subscriptions = await stripe.subscriptions.list({ limit: 100 });
      let allSubscriptions = subscriptions.data;

      while (subscriptions.has_more) {
        subscriptions = await stripe.subscriptions.list({
          limit: 100,
          starting_after: subscriptions.data[subscriptions.data.length - 1].id,
        });
        allSubscriptions = allSubscriptions.concat(subscriptions.data);
      }

      for (const subscription of allSubscriptions) {
        await stripe.subscriptions.cancel(subscription.id);
      }

      res
        .status(200)
        .json({ message: "All subscriptions have been canceled." });
    } catch (error) {
      console.log(error);
      next(new ErrorHandler("Failed to delete all subscriptions", 500));
    }
  },
);

// DELETE SUBSCRIPTION
export const deleteSubscription = catchAsyncError(async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      subscriptionId: req.params.id,
    });

    if (!subscription) {
      return next(new ErrorHandler("Subscription not found!", 404));
    }

    await stripe.subscriptions.cancel(subscription.subscriptionId);

    const deletedSubscription = await Subscription.findOneAndDelete({
      subscriptionId: subscription.subscriptionId,
    });

    if (!deletedSubscription) {
      return next(
        new ErrorHandler("Subscription not found in the database", 404),
      );
    }

    res.status(200).json({
      success: true,
      message: "Subscription Deleted!",
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 400));
  }
});
