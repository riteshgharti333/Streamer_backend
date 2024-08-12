import express from "express";
const router = express.Router();
import { createSubscription,updateSubscription,deleteSubscription,getAllSubscription } from "../controllers/SubscriptionsController.js";


router.post("/createSubscription" ,createSubscription);
router.put("/:id" , updateSubscription);
router.delete("/:id" , deleteSubscription);
router.get("/" , getAllSubscription);

export default router;