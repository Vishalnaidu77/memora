import 'dotenv/config.js'
import app from './src/app.js'
import { connectToDb } from './src/config/dataase.js'
import { scrape } from './demoParse.js'

connectToDb()

app.listen(3001, () => console.log("Server is running on port 3001"))