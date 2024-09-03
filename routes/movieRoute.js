import express from "express";

import {
  createMovie,
  deleteMovie,
  getAllMovies,
  getMovie,
  queryMovie,
  random,
  updateMovie,
} from "../controllers/MovieController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", getAllMovies);
router.get("/random", random);
router.get("/query", queryMovie);
router.get("/:id", getMovie);

router.post("/newmovie", isAuthenticated, isAdmin, createMovie); // Only admins can create movies
router.put("/:id", isAuthenticated, isAdmin, updateMovie); // Only admins can update movies
router.delete("/:id", isAuthenticated, isAdmin, deleteMovie); // Only admins can delete movies

export default router;
