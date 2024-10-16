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
    role: {
      type: String,
      enum: ['user', 'admin'], // Define possible roles
      default: 'user', // Default role is user
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
