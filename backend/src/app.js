import express from 'express'
import itemRouter from './routes/item.routes.js'
import cors from 'cors'
import collectionRouter from './routes/collection.routes.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

const app = express()

const normalizeOrigin = (value) => value.replace(/\/$/, '')

const configuredOrigins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:3000,https://memora-2nd-brain.vercel.app'
)
    .split(',')
    .map((origin) => origin.trim())
    .map(normalizeOrigin)
    .filter(Boolean)

const allowedOrigins = new Set(configuredOrigins)

app.use(cors({
    credentials: true,
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true)
        }

        const normalizedOrigin = normalizeOrigin(origin)

        // Allow local browser extension traffic and Vercel preview/prod domains.
        const isAllowedVercel = /https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)

        if (
            allowedOrigins.has(normalizedOrigin) ||
            normalizedOrigin.startsWith('chrome-extension://') ||
            isAllowedVercel
        ) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))
app.use(cookieParser())
app.use(express.json())

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.use("/api/item", itemRouter)
app.use("/api/collections", collectionRouter)
app.use("/api/auth", authRouter)

export default app

