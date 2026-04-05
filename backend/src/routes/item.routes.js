import express from 'express'
import multer from 'multer'
import { addHighlightController, clusterTopicsController, deleteItemsController, getClustersController, getGraphDataController, getItemsController, relatedItemsController, resurfaceController, saveItemController, searchItemsController, updateItemsController } from '../controllers/item.controller.js'
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
itemRouter.delete("/delete/:itemId", identifyUser, deleteItemsController)

// Search /api/item/search
itemRouter.get("/search", identifyUser, searchItemsController)

// Highlights /api/item/highlights
itemRouter.post("/highlights", identifyUser, addHighlightController)

// Related /api/item/related/:itemId/
itemRouter.get("/related/:itemId", identifyUser, relatedItemsController)

// Resurface /api/item/resurface
itemRouter.get("/resurface", identifyUser, resurfaceController)

// Clusters /api/item/clusters
itemRouter.get("/clusters", identifyUser, getClustersController)

// Topic cluster api/item/cluster-topics
itemRouter.post("/cluster-topics", identifyUser, clusterTopicsController)

// Knowledge graph api/item/graph
itemRouter.get("/graph", identifyUser, getGraphDataController)
export default itemRouter;
