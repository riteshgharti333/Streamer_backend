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
import paymentRouter from "./routes/paymentRoute.js";
import subscriptionRouter from "./routes/subscriptionRoute.js";
import Subscription from "./models/subscriptionModel.js";

// Initialize Express app
export const app = express();

// Load environment variables from the configuration file
config({
  path: "./data/config.env",
});

// Set up Stripe
const endpointSecret = "whsec_...";


// Configure middlewares
app.use(express.json());
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
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_ca6852f0e8c237bcf3678e459b1447b5d2d602c0da92e9fdf4759036e80d6116'; 

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      // Handle subscription creation
      console.log('Subscription created:', event.data.object);
      break;
    case 'customer.subscription.updated':
      // Handle subscription update
      console.log('Subscription updated:', event.data.object);
      break;
    case 'customer.subscription.deleted':
      // Handle subscription deletion
      console.log('Subscription deleted:', event.data.object);
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Respond to Stripe to acknowledge receipt of the event
  res.json({ received: true });
});

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
