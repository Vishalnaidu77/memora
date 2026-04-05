import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
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

collectionSchema.index({ userId: 1, name: 1 })

export const collectionModel = mongoose.model("collections", collectionSchema)
