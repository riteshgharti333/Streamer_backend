// routes.js
import express from "express";
import { createMandate } from "../services/mandateService.js";
import { enablePaymentMethod } from "../services/mandateService.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

const router = express.Router();

// const mollieClient = createMollieClient({ apiKey: 'test_HwFHQ4HSvhTAF7PMp2FpyJKfjwsJpH' });

import { createMollieClient } from '@mollie/api-client';

// Create Mollie client
const mollieClient = createMollieClient({ apiKey: 'test_HwFHQ4HSvhTAF7PMp2FpyJKfjwsJpH' });



// Route to test mandate creation
router.post("/test-mandate", async (req, res) => {
  const { customerId } = req.body; // Assume customerId is provided in the request body

  if (!customerId) {
    return res.status(400).json({
      success: false,
      message: "Customer ID is required",
    });
  }

  try {
    const mandate = await createMandate(customerId);
    res.status(201).json({
      success: true,
      message: "Mandate created successfully",
      mandate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create mandate",
      error: error.message,
    });
  }
});

// Controller function to enable a payment method
router.post("/method/enable", async (req, res) => {
  const { methodId, profileId } = req.body;

  // Validate input
  if (!methodId || !profileId) {
    return res
      .status(400)
      .json({ success: false, message: "methodId and profileId are required" });
  }

  try {
    const method = await enablePaymentMethod(methodId, profileId);

    res.status(200).json({
      success: true,
      message: "Payment method enabled successfully",
      method,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getmandate", async (req, res) => {
  const { mandateId, customerId } = req.body; // Extract mandateId and customerId from request body

  try {
    if (!mandateId || !customerId) {
      return res.status(400).json({
        success: false,
        message: "mandateId and customerId are required",
      });
    }

    const mandate = await mollieClient.customerMandates.get(mandateId, {
      customerId,
    });

    res.status(200).json({
      success: true,
      message: "Mandate retrieved successfully",
      mandate,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve mandate",
      error: error.message,
    });
  }
});

export default router;
