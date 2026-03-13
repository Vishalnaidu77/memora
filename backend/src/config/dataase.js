import mongoose from "mongoose";

export const connectToDb = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connect to DB");   
}