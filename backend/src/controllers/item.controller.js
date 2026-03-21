import mongoose from "mongoose";
import { itemModel } from "../models/item.model.js"
import { fetchMatadata } from "../service/metadata.service.js";
import { generateEmbedding, generateTags } from "../service/ai.service.js";

export async function saveItemController(req, res) {
    try {
        const { url, title, contentType, collectionId } = req.body
        const id = req.user.id  

        console.log(id);
        

        if (!url) {
            return res.status(400).json({ message: "url and title required" })
        }

        let meta = {}

        try {
            meta = await fetchMatadata(url)
        } catch (err) {
            console.error('Failed to fetch metadata:', err.message);
        }

        const finalTitle = title || meta.title || url
        const finalDescription = meta.description || ''


        const item = await itemModel.create({
            userId: new mongoose.Types.ObjectId(id),
            url,
            title: finalTitle,
            description:finalDescription,
            image: meta.image || '',
            siteName: meta.siteName || '',
            contentType: contentType || 'other',
            collectionId: collectionId || null
        })

        await processWithAi(item._id, finalTitle, finalDescription)

        // Fetch the updated item with tags
        const itemWithTags = await itemModel.findById(item._id)

        res.status(201).json({ message: "Item saved", item: itemWithTags })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
 
}


async function processWithAi(itemId, title, description) {
    try {
        const tags = await generateTags(title, description)
        
        console.log('Tags generated:', tags)
        console.log('Saving to itemId:', itemId)

        await itemModel.findByIdAndUpdate(
            itemId,
            { $set: { tags: tags } },
            { new: true }
        )

        // Confirm karo DB se seedha
        const check = await itemModel.findById(itemId)
        console.log('DB check tags:', check?.tags)

    } catch (err) {
        console.error(`AI processing failed:`, err.message)
    }
}

export async function getItemsController(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user)
        const items = await itemModel.find({ userId })

        res.status(200).json({
            message : "Items fetched",
            items
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export async function updateItemsController(req, res) {
    try {
        const { title, description, tags } = req.body
        const itemId = req.params.itemId
        const userId = new mongoose.Types.ObjectId(req.user.id)

        const item = await itemModel.findOne({ _id: itemId, userId })
        
        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        const updatedItem = await itemModel.findByIdAndUpdate(
            itemId,
            { title, description, tags },
            { new: true }
        )

        res.status(200).json({ message: "Item updated", updatedItem })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function deleteItemsController(req, res) {
    try {
        const itemId = req.params.itemId
        const userId = new mongoose.Types.ObjectId(req.user.id)

        const item = await itemModel.findOne({ _id: itemId, userId })

        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        await itemModel.findByIdAndDelete(itemId)

        res.status(200).json({ message: "Item deleted" })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}