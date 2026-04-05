import express from 'express'
import itemRouter from './routes/item.routes.js'
import cors from 'cors'
import collectionRouter from './routes/collection.routes.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

const app = express()

const allowedOrigins = new Set([
    'http://localhost:3000'
])

app.use(cors({
    credentials: true,
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true)
        }

        if (allowedOrigins.has(origin) || origin.startsWith('chrome-extension://')) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))
app.use(cookieParser())
app.use(express.json())

app.use("/api/item", itemRouter)
app.use("/api/collections", collectionRouter)
app.use("/api/auth", authRouter)

export default app

