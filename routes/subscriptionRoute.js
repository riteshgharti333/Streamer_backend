import express from "express";

import {
  createCustomer,
  createSubscriptionSession,
  deleteAllSubscriptions,
  fetchAllSubscriptions,
  getCustomer,
  getSubscriptionDetails,
} from "../controllers/SubscriptionController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/customer/:id", getCustomer);

router.post("/create-customer", isAuthenticated, createCustomer);

router.post(
  "/create-subscription-session",
  isAuthenticated,
  createSubscriptionSession
);

router.get("/:subscriptionId", getSubscriptionDetails);

router.get("/", fetchAllSubscriptions);

router.delete("/delete-all-subscriptions", isAuthenticated, deleteAllSubscriptions);

export default router;
