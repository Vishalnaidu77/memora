import express from 'express'
import itemRouter from './routes/item.routes.js'
import cors from 'cors'
import collectionRouter from './routes/collection.routes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/item", itemRouter)
app.use("/api/collections", collectionRouter)

export default app

