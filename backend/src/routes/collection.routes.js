import express from 'express'
import { createCollectionController, deleteCollectionController, getCollectionController, getSingleCollectionController, updateCollectionController } from '../controllers/collection.controller.js';

const collectionRouter = express.Router()

collectionRouter.post("/create", createCollectionController)

collectionRouter.get("/", getCollectionController)

collectionRouter.get("/:collectionId", getSingleCollectionController)

collectionRouter.patch("/:collectionId", updateCollectionController)

collectionRouter.delete("/:collectionid", deleteCollectionController)

export default collectionRouter;