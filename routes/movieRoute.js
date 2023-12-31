import express from "express";
import { createMovie, deleteMovie, getAllMovies, getMovie, random, updateMovie } from "../controllers/MovieController.js";
const router = express.Router();

router.post("/newmovie", createMovie);
router.get("/", getAllMovies);
router.get("/random", random);
router.get("/:id", getMovie);
router.delete("/:id", deleteMovie);
router.put("/:id", updateMovie);


export default router;