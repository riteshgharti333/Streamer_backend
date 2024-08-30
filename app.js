import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { stripe } from "./config/stripeConfig.js";
import bodyParser from "body-parser";

import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import movieRouter from "./routes/movieRoute.js";
import listRouter from "./routes/listRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import subscriptionRouter from "./routes/subscriptionRoute.js";
import Subscription from "./models/subscriptionModel.js";
import { User } from "./models/userModel.js";

// Initialize Express app
export const app = express();

// Load environment variables from the configuration file
config({
  path: "./data/config.env",
});

// Configure middlewares
app.use(cookieParser());

// Configure CORS settings
const allowedOrigins = ["http://localhost:5173", "http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Set up Stripe webhook endpoint
// Stripe requires the raw body to validate the webhook signature

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret =
      "whsec_ca6852f0e8c237bcf3678e459b1447b5d2d602c0da92e9fdf4759036e80d6116"; // Use environment variable

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const customerId = paymentIntent.customer;

        try {
          // Fetch the customer details
          const customer = await stripe.customers.retrieve(customerId);

          let subscription;
          if (paymentIntent.subscription) {
            subscription = await stripe.subscriptions.retrieve(paymentIntent.subscription);
          }

          return console.log("Subscription id ------------------->" + paymentIntent.subscription);

          const subscriptionData = {
            customerId: customerId,
            subscriptionId: paymentIntent.subscription,
            plan: paymentIntent.metadata.plan,
            startDate: new Date(paymentIntent.created * 1000).toISOString(),
            endDate: new Date(
              paymentIntent.created * 1000 + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "active",
            price: paymentIntent.metadata.amount,
            email: customer.email, // Get email from customer object
            name: customer.name, // Get name from customer object
          };

          console.log("Creating subscription with data:", subscriptionData);

          const newSubscription = new Subscription(subscriptionData);

          await newSubscription.save();

          // Link the subscription to the user
          await User.findByIdAndUpdate(paymentIntent.metadata.userId, {
            subscription: newSubscription._id,
          });

          res.status(200).send("Success");
        } catch (error) {
          console.error(
            "Error saving subscription or fetching customer:",
            error
          );
          res.status(500).send("Failed to save subscription");
        }
        break;
      case "customer.subscription.created":
        handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Respond to Stripe to acknowledge receipt of the event
    res.json({ received: true });
  }
);

// Define functions to handle Stripe events
const handleSubscriptionCreated = async (subscription) => {
  try {
    const subscriptionData = {
      userId: subscription.metadata.userId, // Make sure to set metadata when creating subscriptions
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      plan: subscription.items.data[0].price.id,
      startDate: new Date(subscription.start_date * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      price: subscription.items.data[0].price.unit_amount / 100,
    };
    await Subscription.create(subscriptionData);
    console.log("Subscription created and saved:", subscriptionData);
  } catch (error) {
    console.error("Error saving subscription:", error);
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  try {
    const updatedData = {
      plan: subscription.items.data[0].price.id,
      startDate: new Date(subscription.start_date * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      price: subscription.items.data[0].price.unit_amount / 100,
    };
    await Subscription.findOneAndUpdate(
      { subscriptionId: subscription.id },
      updatedData,
      { new: true }
    );
    console.log("Subscription updated:", updatedData);
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  try {
    await Subscription.findOneAndDelete({ subscriptionId: subscription.id });
    console.log("Subscription deleted:", subscription.id);
  } catch (error) {
    console.error("Error deleting subscription:", error);
  }
};

const handlePaymentSucceeded = async (invoice) => {
  console.log("Payment succeeded for invoice:", invoice.id);
  // Optionally, update the user or subscription status in the database
};

const handlePaymentFailed = async (invoice) => {
  console.log("Payment failed for invoice:", invoice.id);
  // Optionally, handle failed payments (e.g., notify user, update status)
};

app.use(express.json());

// Configure application routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/list", listRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/subscriptions", subscriptionRouter);

// Set up a simple root route
app.get("/", (req, res) => {
  res.send("Welcome To Streamer");
});

// Configure error handling middleware
app.use(errorMiddleware);
