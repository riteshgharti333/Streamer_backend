import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
