import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import  mollieClient  from "../config/mollieConfig.js";

export const createSubscription = catchAsyncError(async (req, res, next) => {
  const {
    customerId,
    amount,
    times,
    interval,
    startDate, // Can be null or provided
    description,
    webhookUrl,
  } = req.body;

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split('T')[0];

  // Use todayDate if startDate is not provided or in the past
  const validatedStartDate = startDate && startDate >= todayDate ? startDate : todayDate;

  try {
    const subscription = await mollieClient.customerSubscriptions.create({
      customerId,
      amount: {
        currency: amount.currency,
        value: amount.value,
      },
      times,
      interval,
      startDate: validatedStartDate,
      description,
      webhookUrl,
    });

    res.status(201).json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error); // Forward the error to the global error handler
    console.log(error);
  }
});


export const getSubscriptionStatus = catchAsyncError(async (req, res, next) => {
  const { subscriptionId } = req.params;

  try {
    const subscription = await mollieClient.customerSubscriptions.get(
      subscriptionId
    );

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error); // Forward the error to the global error handler
    console.log(error)
  }
});
