import express from "express";
import {createList, updateList , deleteList, getLists, getSingleList} from "../controllers/ListController.js"

const router = express.Router();

router.get("/" , getLists);
router.post("/newlist" , createList);
router.get("/:id" , getSingleList);
router.put("/:id" , updateList);
router.delete("/:id" , deleteList);


export default router;
