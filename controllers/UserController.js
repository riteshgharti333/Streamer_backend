import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const getUser = await User.findById(req.params.id);

  if (!getUser) return next(new ErrorHandler("User not found!", 404));

  res.status(200).json({
    success: true,
    getUser,
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

