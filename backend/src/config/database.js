import mongoose from "mongoose";
import dns from 'dns'

export const connectToDb = async () => {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connect to DB");   
}