import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/errorHandler.js";
import Subscription from "../models/subscriptionModel.js";


// REGISTER 

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 400));

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
    isAdmin,
  });

  res.status(201).json({
    success: true,
    message: "Registered Successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

// LOGIN

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Email or Password", 400));

    sendCookie(user, res, `Login Successfully`, 200);
  } catch (error) {
    next(error);
  }
};

// PROFILE

export const myProfile = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;
    const subscription = await Subscription.find({ userId: user._id });

    res.status(200).json({
      success: true,
      userDetails: {
        user,
        subscription: subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});



// LOGOUT

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successfully",
      user: req.user,
    });
});





export const updateProfile = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  // Check if user exists
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update name if provided
  if (req.body.name) {
    user.name = req.body.name;
  }

  // Check if the email is being updated and ensure it's not already in use
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user.email = req.body.email;
  }

  // Update password if provided
  if (req.body.password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
  }

  // Save updated user data
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: req.user
  });
});


export const updatePassword = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return next(new ErrorHandler("User not found!", 404));

    const { currentPassword, newPassword } = req.body;

    // Check if the current password matches the one in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return next(new ErrorHandler("Invalid current password", 400));

    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      return next(new ErrorHandler("New password cannot be the same as the current password", 400));

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // Save the updated user with the new password
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
