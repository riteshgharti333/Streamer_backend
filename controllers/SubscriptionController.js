import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { stripe } from "../config/stripeConfig.js";
import { User } from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";

export const createCustomer = catchAsyncError(async (req, res, next) => {
  try {
    const { email, payment_method, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name, // Add the user's name
      payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
      metadata: {
        // Optional: Store additional information if needed
        userId: req.body.userId // Assuming userId is passed in the request body
      }
    });

    res.json({ customer });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});


export const getCustomer = catchAsyncError(async (req, res, next) => {
  const { id } = req.params; // Get the customer ID from the request parameters

  try {
    // Fetch the customer from Stripe using the provided ID
    const customer = await stripe.customers.retrieve(id);

    res.status(200).json(customer); // Send the customer data back in the response
  } catch (error) {
    console.error("Error fetching customer from Stripe:", error);

    // Handle errors, such as when the customer ID is invalid
    if (error.type === "StripeInvalidRequestError") {
      res.status(400).json({ error: "Invalid customer ID" });
    } else {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  }
});


export const createSubscriptionSession = catchAsyncError(
  async (req, res, next) => {
    try {
      const { email, priceId, userId, name } = req.body;

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
        metadata: {
          userId,  // User ID from your database
          name,    // The plan user selected
        },
      });

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

export const fetchAllSubscriptions = catchAsyncError(async (req, res, next) => {
  try {
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });

    // Count the number of subscriptions
    const subscriptionCount = subscriptions.data.length;

    // Respond with the count and the list of subscriptions
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
