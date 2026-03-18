import express from 'express'
import { identifyUser } from '../middleware/auth.middleware'
import { loginController, registerController } from '../controllers/auth.controller'

const authRouter = express.Router()

authRouter.post("/register", identifyUser, registerController)
authRouter.login("/register", identifyUser, loginController)

export default authRouter