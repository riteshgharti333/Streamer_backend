import { config } from "dotenv";
import Stripe from "stripe";

config({
    path: "./data/config.env",
  });

export const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
