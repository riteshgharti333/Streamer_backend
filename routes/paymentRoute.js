import {
  createPayment,
  getPaymentStatus,
} from "../controllers/PaymentController.js";

import express from "express";

const router = express.Router();

router.post("/create", createPayment);

router.get("/status/:id", getPaymentStatus);

export default router;
