import express from "express";

import {
  createCustomer,
  createSubscription,
} from "../controllers/SubscriptionController.js";

const router = express.Router();

router.post("/create-subscription", createSubscription);

router.post("/create-customer", createCustomer);

export default router;
