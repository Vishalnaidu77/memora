import express from 'express'
import { deleteItemsController, getItemsController, saveItemController, updateItemsController } from '../controllers/item.controller.js'

const itemRouter = express.Router()

// POST /api/item/save
itemRouter.post("/save", saveItemController)

// GET /api/item/get-items
itemRouter.get("/get-item", getItemsController)

// PATCH /api/item/update/:itemId
itemRouter.patch("/update/:itemId", updateItemsController)

// DELETE /api/item/delete/:itemId
itemRouter.delete("/delete/:itemId", deleteItemsController)
export default itemRouter;