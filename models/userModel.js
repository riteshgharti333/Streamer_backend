import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    subscriptions: [ // Array to store multiple subscriptions with details
      {
        subscription_id: String,
        plan: String,
        price: Number
      }
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
