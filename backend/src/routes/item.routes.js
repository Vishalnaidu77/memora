import express from 'express'
import { deleteItemsController, getItemsController, saveItemController, updateItemsController } from '../controllers/item.controller.js'
import { identifyUser } from '../middleware/auth.middleware.js'

const itemRouter = express.Router()

// POST /api/item/save
itemRouter.post("/save", identifyUser, saveItemController)

// GET /api/item/get-item
itemRouter.get("/get-item", identifyUser, getItemsController)

// PATCH /api/item/update/:itemId
itemRouter.patch("/update/:itemId", updateItemsController)

// DELETE /api/item/delete/:itemId
itemRouter.delete("/delete/:itemId", deleteItemsController)
export default itemRouter;