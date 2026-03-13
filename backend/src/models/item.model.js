import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    url: {
        type: String,
        require: true
    },
    title: String,
    tags: [String]
}, { timestamps: true})

export const itemModel = mongoose.model("items", itemSchema)