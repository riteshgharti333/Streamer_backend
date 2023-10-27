import express from "express";
import {createList, updateList , deleteList ,getList} from "../controllers/ListController.js"

const router = express.Router();

router.post("/newlist" , createList);
router.put("/:id" , updateList);
router.delete("/:id" , deleteList);
router.get("/" , getList);




export default router;
