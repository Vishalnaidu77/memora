import express from 'express'
import { deleteItemsController, getItemsController, saveItemController, searchItemsController, updateItemsController } from '../controllers/item.controller.js'
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

// Search /api/item/search
itemRouter.get("/search", identifyUser, searchItemsController)
export default itemRouter;