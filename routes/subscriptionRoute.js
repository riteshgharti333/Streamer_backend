import express from "express";

import {
  createCustomer,
  createSubscription,
  createSubscriptionSession,
  getSubscriptionDetails,
  saveSubscription,
} from "../controllers/SubscriptionController.js";

const router = express.Router();

router.post("/create-subscription", createSubscription);

router.post("/create-customer", createCustomer);

router.post("/create-subscription-session", createSubscriptionSession);

router.post("/saveSubscription" , saveSubscription)

router.get("/:subscriptionId", getSubscriptionDetails);







export default router;
