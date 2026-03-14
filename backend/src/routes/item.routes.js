import express from 'express'
import { getItemsController, itemController } from '../controllers/item.controller.js'

const itemRouter = express.Router()

// POST /api/item/save
itemRouter.post("/save", itemController)

// GET /api/item/get-items
itemRouter.get("/get-item", getItemsController)
export default itemRouter;