import express from "express";
import {
  forgotPassword,
  login,
  logout,
  myProfile,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/AuthController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout" , logout);

router.get("/profile", isAuthenticated, myProfile);

router.put("/profile", isAuthenticated, updateProfile);

router.put("/update-password", isAuthenticated, updatePassword);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:id/:token", resetPassword);

export default router;
