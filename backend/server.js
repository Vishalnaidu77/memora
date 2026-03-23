import 'dotenv/config.js'
import app from './src/app.js'
import { connectToDb } from './src/config/database.js'
import { scrape } from './demoParse.js'
import { initCollection } from './src/service/qdrant.service.js'

connectToDb()
initCollection()
    .then(() => console.log("Qdrant ready"))
    .catch((err) => console.log("Qdrant init failed:", err.message))

app.listen(3001, () => console.log("Server is running on port 3001"))