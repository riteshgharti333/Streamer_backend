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
    password: {
      type: String,
      required: true,
    },
     currentPassword: {
      type: String,
      select: false, 
    },
    newPassword: {
      type: String,
      select: false, 
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    subscriptions: [
      {
        subscription_id: String,
        priceId: String,
      }
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
