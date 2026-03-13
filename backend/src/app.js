import express from 'express'
import itemRouter from './routes/item.routes.js'

const app = express()
app.use(express.json())

app.use("/api/item", itemRouter)

export default app

