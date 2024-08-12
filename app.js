import express from "express";
import {config} from "dotenv";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./routes/authRoute.js";
import movieRouter from "./routes/movieRoute.js";
import listRouter from "./routes/listRoute.js";
import SubscriptionRouter from "./routes/subscriptionRoute.js"


export const app = express();

config({
    path: "./data/config.env"
});

// Using Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)

// Using Routes
app.use("/api/auth", authRouter)
app.use("/api/movies", movieRouter)
app.use("/api/list", listRouter)
app.use("/api/subscription",SubscriptionRouter)



app.get("/" , (req,res) => {
    res.send("WelCome To Streamer");
})


// Using Error MiddleWare
app.use(errorMiddleware);