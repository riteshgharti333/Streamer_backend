import express from "express";
import {
  createList,
  updateList,
  deleteList,
  getLists,
  getSingleList,
} from "../controllers/ListController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", getLists);
router.get("/:id", getSingleList);

// Routes that require authentication and admin checks
router.post("/newlist", isAuthenticated, isAdmin, createList); // Only admins can create a list
router.put("/:id", isAuthenticated, isAdmin, updateList); // Only admins can update a list
router.delete("/:id", isAuthenticated, isAdmin, deleteList); // Only admins can delete a list

export default router;
