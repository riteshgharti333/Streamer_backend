import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Subscription } from "../models/subscriptionModel.js";

export const createSubscription = catchAsyncError(async (req, res, next) => {
  const newSubscription = new Subscription(req.body);

  const savedSubscription = await newSubscription.save();

  res.status(201).json({
    success: true,
    savedSubscription,
  });
});

export const getAllSubscription = catchAsyncError(async (req, res, next) => {
  const subscription = await Subscription.find();

  res.status(201).json({
    success: true,
    subscription,
  });
});



export const deleteSubscription = catchAsyncError(async (req, res, next) => {
  const deleteSubscription = await Subscription.findByIdAndDelete(req.params.id);

  if (!deleteSubscription) return next(new Error("Subscription not found!"));

  res.status(200).json({
    success: true,
    message: "Subscription Deleted",
  });
});

export const updateSubscription = catchAsyncError(async (req, res, next) => {
  const updateSubscription = await Subscription.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );

  if (!updateSubscription) return next(new Error("Subscription not found", 404));

  res.status(200).json({
    success: true,
    updateSubscription,
  });
});

