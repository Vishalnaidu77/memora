import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    userId: {          // ← ADD THIS
        type: String,
        required: true
    },
    name: {
        type: String,
        require: true
    },
    description: String,
    color: {
        type: String,
        default: "#3B82F6"
    },
    icon: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

export const collectionModel = mongoose.model("collections", collectionSchema)