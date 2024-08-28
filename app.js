import express from "express";
import {config} from "dotenv";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";


import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";

import movieRouter from "./routes/movieRoute.js";
import listRouter from "./routes/listRoute.js";

import paymentRouter from "./routes/paymentRoute.js"
import subscriptionRouter from "./routes/subscriptionRoute.js"
import mendetaRouter from "./routes/mendeta.js";
import Stripe from "stripe";
import bodyParser from "body-parser";

export const app = express();

config({
    path: "./data/config.env"
});

// console.log(process.env.SQUARE_ACCESS_TOKEN);



// Using Middlewares
app.use(express.json());
app.use(cookieParser());
// app.use(
//     cors({
//         origin: [process.env.FRONTEND_URL],
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         credentials: true,
//     })
// )

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001'];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed methods
        credentials: true, // If your frontend needs to send cookies or auth headers, set this to true
    })
);

const stripe = Stripe
('sk_test_51MES7zSGN61YzC6ZgtCXkv5GDJFn4TwB5WFSvNARxqi1SEhJcv2ZnBy1srU8DeHGR1BSRwr666In6SdXPFKI0LSf00OLI0la8G')

const endpointSecret = "whsec_...";

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }), // Use raw body parser for Stripe webhook
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      // Verify webhook signature and extract the event
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "invoice.payment_succeeded":
        // Handle successful payment
        const paymentIntent = event.data.object;
        console.log("PaymentIntent was successful!");
        break;
      case "invoice.payment_failed":
        // Handle failed payment
        console.log("PaymentIntent failed!");
        break;
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt of the event
    response.json({ received: true });
  }
);


// Using Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/movies", movieRouter)
app.use("/api/list", listRouter)

app.use('/api/payments', paymentRouter);
app.use('/api/subscriptions', subscriptionRouter);
// app.use('/api', mendetaRouter);




app.get("/" , (req,res) => {
    res.send("WelCome To Streamer");
})


// Using Error MiddleWare
app.use(errorMiddleware);