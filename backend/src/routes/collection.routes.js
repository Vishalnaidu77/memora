import express from 'express'
import { createCollectionController, deleteCollectionController, getCollectionController, getSingleCollectionController, updateCollectionController } from '../controllers/collection.controller.js';
import { identifyUser } from '../middleware/auth.middleware.js'

const collectionRouter = express.Router()

collectionRouter.post("/create", identifyUser, createCollectionController)

collectionRouter.get("/", identifyUser, getCollectionController)

collectionRouter.get("/:collectionId", identifyUser, getSingleCollectionController)

collectionRouter.patch("/:collectionId", identifyUser, updateCollectionController)

collectionRouter.delete("/:collectionId", identifyUser, deleteCollectionController)

export default collectionRouter;
