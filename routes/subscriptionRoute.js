import express from "express";

import {
  createCustomer,
  createSubscriptionSession,
  fetchAllSubscriptions,
  getCustomer,
  getSubscriptionDetails,
} from "../controllers/SubscriptionController.js";

const router = express.Router();

router.get("/customer/:id", getCustomer);

router.post("/create-customer", createCustomer);

router.post("/create-subscription-session", createSubscriptionSession);

router.get("/:subscriptionId", getSubscriptionDetails);

router.get("/", fetchAllSubscriptions);







export default router;
