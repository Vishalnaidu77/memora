import mongoose from "mongoose";
import { itemModel } from "../models/item.model.js"
import { fetchMatadata } from "../service/metadata.service.js";
import { generateEmbedding, generateTags } from "../service/ai.service.js";
import { searchSimilar, storeVector } from "../service/qdrant.service.js";

export async function saveItemController(req, res) {
    try {
        const { url, title, contentType, collectionId } = req.body
        const id = req.user.id 

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

        await processWithAi(item._id, id, finalTitle, finalDescription)

        // Fetch the updated item with tags
        const itemWithTags = await itemModel.findById(item._id)

        res.status(201).json({ message: "Item saved", item: itemWithTags })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
 
}

async function processWithAi(itemId, userId, title, description) {
    try {
        const text = `${title}. ${description}`

        const [ tagsRaw, embeddings ] = await Promise.all([
            generateTags(title, description),
            generateEmbedding(text)
        ])

        // Validate tags: must be array of strings
        let tags = Array.isArray(tagsRaw) ? tagsRaw.filter(t => typeof t === 'string') : [];
        if (!Array.isArray(tags) || tags.length === 0) {
            console.error('Tags validation failed, got:', tagsRaw)
            tags = [];
            }

        let qdrantId = null
        if(embeddings){
            try {
                qdrantId = await storeVector(itemId, embeddings, {
                    userId: userId.toString(),
                    title: title,
                    tags: tags // log tags sent to Qdrant
                }, userId)
            } catch (qErr) {
                console.error('Qdrant store failed (payload):', {
                    itemId, embeddings, userId, title, tags
                }, qErr.message)
                throw qErr;
            }
        }

        await itemModel.findByIdAndUpdate(
            itemId,
            { $set: 
                { 
                    tags: tags,
                    chromaId: qdrantId
                } 
            },
            { new: true }
        )        

    } catch (err) {
        console.error(`AI processing failed:`, err.message)
    }
}

export async function getItemsController(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)
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
        const userId = new mongoose.Types.ObjectId(req.user)

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

export async function searchItemsController(req, res) {
    try {
        const { item } = req.query
        const userId = req.user.id
    
        if(!userId){
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }
        
        if(!item){
            return res.status(400).json({
                message: "Search query is required"
            })
        }

        const embeddings = await generateEmbedding(item)
        console.log("Embedding length", embeddings?.length);
        
        if(!embeddings){
            return res.status(500).json({
                message: "Failed to generate embeddings for search"
            })
        }

        const mongoIds = await searchSimilar(embeddings, userId)
        console.log("Mongo id", mongoIds);


        const items = await itemModel.find({
            _id: { $in: mongoIds }
        })

        res.status(200).json({
            message: "Search result",
            items
        })

    } catch (err) {
        console.error("Search failed:", err.message)
        res.status(500).json({ message: "Search failed" })
    }
}

export async function relatedItemsController(req, res) {
    try {
        const itemId = req.params.itemId
        const userId = req.user.id
        console.log("Userid", userId);
        
        const item = await itemModel.findOne({ _id: itemId })

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            })
        }
        console.log("item", item);

        const text = `${item.title}. ${item.description}`
        const embeddings = await generateEmbedding(text)

        const mongoIds = await searchSimilar(embeddings, userId)
        const filteredIds = mongoIds.filter(id => id !== itemId)
        console.log("mongo ID", mongoIds);
        
        console.log("Filter",filteredIds);

        const relatedItems = await itemModel.find({
            _id: { $in: filteredIds}
        })
        console.log("Related",relatedItems);

        res.status(200).json({
            message: "Related items fetched successfully",
            relatedItems
        })

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}