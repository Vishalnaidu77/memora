import express from 'express'
import { itemController } from '../controllers/item.controller.js'

const itemRouter = express.Router()

itemRouter.post("/save-item", itemController)

export default itemRouter;