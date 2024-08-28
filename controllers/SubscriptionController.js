import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { stripe } from "../config/stripeConfig.js";


export const createCustomer = catchAsyncError(async (req, res, next) => {
  try {
    const { email, payment_method } = req.body;

    const customer = await stripe.customers.create({
      email,
      payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    res.json({ customer });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

export const createSubscription = catchAsyncError(async (req, res, next) => {
  try {
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.json({ subscription });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});


