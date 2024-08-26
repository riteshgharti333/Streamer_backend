import express from "express";
import { getCustomerIdFromUserId, login, logout, myProfile, register } from "../controllers/AuthController.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get('/customer/:userId', getCustomerIdFromUserId);

router.get("/profile", isAuthenticated , myProfile);


export default router;
