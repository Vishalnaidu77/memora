import express from 'express'
import itemRouter from './routes/item.routes.js'
import cors from 'cors'
import collectionRouter from './routes/collection.routes.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(cookieParser())
app.use(express.json())

app.use("/api/item", itemRouter)
app.use("/api/collections", collectionRouter)
app.use("/api/auth", authRouter)

export default app

