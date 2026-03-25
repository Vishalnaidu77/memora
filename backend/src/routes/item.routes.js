import express from 'express'
import multer from 'multer'
import { deleteItemsController, getItemsController, relatedItemsController, resurfaceController, saveItemController, searchItemsController, updateItemsController } from '../controllers/item.controller.js'
import { identifyUser } from '../middleware/auth.middleware.js'

const itemRouter = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// POST /api/item/save
itemRouter.post("/save", identifyUser, upload.single("file"), saveItemController)

// GET /api/item/get-item
itemRouter.get("/get-item", identifyUser, getItemsController)

// PATCH /api/item/update/:itemId
itemRouter.patch("/update/:itemId", updateItemsController)

// DELETE /api/item/delete/:itemId
itemRouter.delete("/delete/:itemId", deleteItemsController)

// Search /api/item/search
itemRouter.get("/search", identifyUser, searchItemsController)

// Related /api/item/related/:itemId/
itemRouter.get("/related/:itemId", identifyUser, relatedItemsController)

// Resurface /api/item/resurface
itemRouter.get("/resurface", identifyUser, resurfaceController)
export default itemRouter;
