import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { stripe } from "./config/stripeConfig.js";
import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import movieRouter from "./routes/movieRoute.js";
import listRouter from "./routes/listRoute.js";
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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "https://streamer-frontend-z72w.vercel.app", // Add your Vercel frontend URL here
];

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
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Define functions to handle Stripe events
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const subscriptionId = session.subscription;
    if (!subscriptionId) throw new Error("No subscription ID found");

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionDescription =
      subscription.payment_settings.payment_method_options.card.mandate_options
        .description;

    const subscriptionPrice =
      subscription.payment_settings.payment_method_options.card.mandate_options
        .amount;

    const price = subscriptionPrice / 100;

    const subscriptionData = {
      userId: session.metadata.userId,
      name: session.customer_details.name,
      email: session.customer_email,
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      plan: subscriptionDescription,
      priceId: subscription.items.data[0].price.id,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      price: price,
    };

    const newSubscription = new Subscription(subscriptionData);
    await newSubscription.save();
    console.log("Subscription saved:", newSubscription);

    const userSubscriptionData = {
      subscription_id: subscription.id,
      priceId: subscription.items.data[0].price.id,
    };

    const updatedUser = await User.findByIdAndUpdate(
      session.metadata.userId,
      {
        $push: { subscriptions: userSubscriptionData },
      },
      { new: true }
    );
    if (updatedUser) {
      console.log("User subscription updated:", updatedUser);
    } else {
      console.log("User not found or failed to update.");
    }
  } catch (err) {
    console.error("Failed to retrieve subscription or save to database:", err);
  }
};

const handlePaymentSucceeded = async (invoice) => {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) throw new Error("No subscription ID found");

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await Subscription.findOneAndUpdate(
      { subscriptionId: subscription.id },
      {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
      { new: true }
    );
    console.log("Subscription updated:", subscription);
  } catch (err) {
    console.error("Error updating subscription:", err);
  }
};

const handleSubscriptionCreated = async (subscription) => {
  try {
    const subscriptionDescription =
      subscription.payment_settings.payment_method_options.card.mandate_options
        .description;

    const subscriptionPrice =
      subscription.payment_settings.payment_method_options.card.mandate_options
        .amount;

    const price = subscriptionPrice / 100;

    const subscriptionData = {
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      plan: subscriptionDescription,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      price: price,
    };
    // await Subscription.create(subscriptionData);
    // console.log("Subscription created and saved:", subscriptionData);
  } catch (err) {
    console.error("Error saving subscription:", err);
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  try {
    const updatedData = {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
    await Subscription.findOneAndUpdate(
      { subscriptionId: subscription.id },
      updatedData,
      { new: true }
    );
    console.log("Subscription updated:", updatedData);
  } catch (err) {
    console.error("Error updating subscription:", err);
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  try {
    await Subscription.findOneAndDelete({
      subscriptionId: subscription.id,
    });
  } catch (err) {
    console.error("Error deleting subscription:", err);
  }
};

app.use(express.json());

// Configure application routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/list", listRouter);
app.use("/api/subscriptions", subscriptionRouter);

// Set up a simple root route
app.get("/", (req, res) => {
  res.send("Welcome To Streamer");
});

// Configure error handling middleware
app.use(errorMiddleware);
