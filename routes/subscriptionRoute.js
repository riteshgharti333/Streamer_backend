import express from "express";

import {
  createCustomer,
  createSubscriptionSession,
  deleteAllSubscriptions,
  deleteSubscription,
  getCustomer,
  getSubscriptionData,
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

// router.get("/", fetchAllSubscriptions);


router.get("/", getSubscriptionData);


router.get("/:subscriptionId", getSubscriptionDetails);




router.delete("/delete-all-subscriptions", isAuthenticated, deleteAllSubscriptions);

router.delete('/:subscriptionId/:userId', isAuthenticated ,  deleteSubscription);

export default router;
