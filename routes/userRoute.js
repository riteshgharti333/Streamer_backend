import express from "express"
import { deleteUser, getAllUser, getSingleUser } from "../controllers/UserController.js"

const router = express.Router();

router.get("/",getAllUser);
router.get("/:id",getSingleUser);
router.delete("/:id",deleteUser);


export default router