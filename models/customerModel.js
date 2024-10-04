import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, default: "IN" }, // Default to India
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  address: addressSchema, // Embed address schema
  stripeCustomerId: { type: String }, // Store Stripe customer ID
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
