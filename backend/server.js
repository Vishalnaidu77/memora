import 'dotenv/config.js'
import app from './src/app.js'
import { connectToDb } from './src/config/dataase.js'

connectToDb()

app.listen(3001, () => console.log("Server is running on port 3001"))