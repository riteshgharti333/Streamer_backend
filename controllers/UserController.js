import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Subscription from "../models/subscriptionModel.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const getAllUser = catchAsyncError(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  
  if (req.user && req.params.id === req.user._id.toString() && req.body.role) {
    return res.status(403).json({
      success: false,
      message: "You cannot update your own role.",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    {
      new: true,
    },
  );

  if (!user) return next(new Error("User not found!", 404));

  res.status(200).json({
    success: true,
    user,
  });
});


export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const getUser = await User.findById(req.params.id);

  if (!getUser) return next(new ErrorHandler("User not found!", 404));

  const subscription = await Subscription.find({ userId: getUser });

  res.status(200).json({
    success: true,
    userDetails: {
      getUser,
      subscription: subscription,
    },
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const deleteUser = await User.findByIdAndDelete(req.params.id);

  if (!deleteUser) return next(new Error("User not found!", 404));

  res.status(200).json({
    success: true,
    message: "User Deleted",
  });
});
