import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const createPayment = catchAsyncError(async (req, res, next) => {});

export const getPaymentStatus = catchAsyncError(async (req, res, next) => {});
