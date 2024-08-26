import express from "express";

import {
    createSubscription,
    getSubscriptionStatus,
  } from "../controllers/SubscriptionController.js";
 

  const router = express.Router();
  
  router.post("/create", createSubscription);
  
  router.get("/status/:id", getSubscriptionStatus);
  
  export default router;
  