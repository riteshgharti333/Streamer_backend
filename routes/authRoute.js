import express from "express";
import { login, logout, myProfile, register, updatePassword, updateProfile } from "../controllers/AuthController.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/profile" , isAuthenticated,  myProfile);

router.put("/profile" , isAuthenticated,  updateProfile);

router.put("/update-password" , isAuthenticated,  updatePassword);




export default router;
