import express from "express";
import { login, logout, myProfile, register } from "../controllers/UserController.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/profile", isAuthenticated , myProfile);


export default router;
