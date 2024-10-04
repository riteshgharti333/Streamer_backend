import express from "express";
import {
  deleteUser,
  getAllUser,
  getSingleUser,
  updateUser,
} from "../controllers/UserController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", getAllUser);
router.get("/:id", getSingleUser);
router.delete("/:id", isAuthenticated, isAdmin, deleteUser);

router.put("/:id", isAuthenticated, isAdmin, updateUser);

export default router;
