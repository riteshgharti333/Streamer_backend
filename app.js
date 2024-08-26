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

// Using Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/movies", movieRouter)
app.use("/api/list", listRouter)

app.use('/api/payments', paymentRouter);
app.use('/api/subscriptions', subscriptionRouter);



app.get("/" , (req,res) => {
    res.send("WelCome To Streamer");
})


// Using Error MiddleWare
app.use(errorMiddleware);