import express from "express";
import Subscription from "./models/subscriptionModel.js";

const router = express.Router();

// Create a new subscription
router.post("/new-subscriptions", async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
