import mongoose from "mongoose";
import { itemModel } from "../models/item.model.js"
import { fetchMatadata } from "../service/metadata.service.js";
import { generateEmbedding, generateTags } from "../service/ai.service.js";
import { searchSimilar, storeVector } from "../service/qdrant.service.js";
import { uploadFile } from "../service/supabse.service.js";
import { randomUUID } from "crypto";
import { extractTextFromImage, extractTextFromPdf } from "../service/file.processor.js";
import { clusterUserTopics } from "../service/topic.service.js";

export async function saveItemController(req, res) {
    try {
        const { url, title, contentType, collectionId } = req.body
        const id = req.user.id 
        const uploadedFile = req.file

        if (!url && !uploadedFile) {
            return res.status(400).json({ message: "A url or file is required" })
        }

        let meta = {}

        if (url) {
            try {
                meta = await fetchMatadata(url)
            } catch (err) {
                console.error('Failed to fetch metadata:', err.message);
            }
        }

        let fileData = null
        if (uploadedFile) {
            const objectName = `${id}/${randomUUID()}-${uploadedFile.originalname}`
            const fileUrl = await uploadFile(
                "memoraDb",
                objectName,
                uploadedFile.buffer,
                uploadedFile.mimetype
            )

            fileData = {
                storagePath: objectName,
                fileUrl,
                mimeType: uploadedFile.mimetype,
                fileSize: uploadedFile.size,
                originalFileName: uploadedFile.originalname
            }
        }

        let extractedText = null;
        if(uploadedFile){
            const mimeType = uploadedFile.mimetype;
            if(mimeType === 'application/pdf'){
                extractedText = await extractTextFromPdf(fileData.fileUrl)
            } else if(mimeType.startsWith('image/')){
                extractedText = await extractTextFromImage(
                    fileData.fileUrl,
                    uploadedFile.mimetype
                )
            }
            console.log(mimeType);
            
            console.log("Extracted text length:", extractedText?.length);
            
        }

        const finalTitle = title || meta.title || uploadedFile?.originalname || url
        const finalDescription = meta.description || ''
        const finalContent = extractedText || meta.content || ''
        const resolvedContentType = resolveContentType(
            contentType || uploadedFile?.mimetype
        )

        const item = await itemModel.create({
            userId: new mongoose.Types.ObjectId(id),
            url: url || null,
            title: finalTitle,
            description: finalDescription,
            image: meta.image || fileData?.fileUrl || '',
            siteName: meta.siteName || '',
            content: finalContent,
            contentType: resolvedContentType,
            collectionId: collectionId || null,
            file: fileData
        })

        await processWithAi(item._id, id, finalTitle, finalDescription, finalContent, resolvedContentType)

        // Fetch the updated item with tags
        const itemWithTags = await itemModel.findById(item._id)

        res.status(201).json({ message: "Item saved", item: itemWithTags })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
 
}

function resolveContentType(mimeType) {
    if (!mimeType) return 'other'
    if (['article', 'tweet', 'image', 'video', 'pdf', 'file', 'other'].includes(mimeType)) {
        return mimeType
    }
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'file'
}

async function processWithAi(itemId, userId, title, description, content = '', contentType = 'other') {
    try {
        const text = [title, description, content].filter(Boolean).join('. ')

        const [ tagsRaw, embeddings ] = await Promise.all([
            generateTags(title, [description, content].filter(Boolean).join('. ')),
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
                    tags: tags,
                    description,
                    contentType,
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
        const itemId = new mongoose.Types.ObjectId(req.params.itemId)
        const userId = new mongoose.Types.ObjectId(req.user)

        console.log(itemId, userId);
    
        const item = await itemModel.findOne({ _id: itemId, userId })
        console.log(item);

        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        const deletedItem = await itemModel.findByIdAndDelete(itemId)

        res.status(200).json({ message: "Item deleted", deletedItem })

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

export async function resurfaceController(req, res) {
    const userId = req.user.id

    if(!userId){
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    const daysAgo = (days) => {
        const date = new Date()
        date.setDate(date.getDate() - days)
        return date
    }

    const items = await itemModel.find({
        userId,
        createdAt: {
            $lte: daysAgo(2)
        },
        resurfaceCount: {
            $lte: 5
        }
    }).limit(5)

    // await itemModel.updateMany(
    //     {
    //         _id: { $in: items.map(i => i._id)}
    //     },
    //     {
    //         $inc: { resurfaceCount: 1 },
    //         $set: { lastResurfaceDate: new Date() }
    //     }
    // )
    
    res.status(200).json({
        message: "Fetch resurface items",
        items
    })
}

export async function getClustersController(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const items = await itemModel.find({
            userId,
            topicClusterId: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 })

        const groupedMap = new Map()

        for (const item of items) {
            const clusterId = item.topicClusterId
            const topicLabel = item.topicLabel || 'General'

            if (!clusterId) continue

            if (!groupedMap.has(clusterId)) {
                groupedMap.set(clusterId, {
                    clusterId,
                    topicLabel,
                    count: 0,
                    items: []
                })
            }

            const cluster = groupedMap.get(clusterId)
            cluster.items.push(item)
            cluster.count += 1
        }

        const clusters = [...groupedMap.values()].sort((left, right) => right.count - left.count)

        res.status(200).json({
            message: "Clusters fetched successfully",
            clusters
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export async function clusterTopicsController(req, res){
    try {
        const userId = req.user.id

        if(!userId){
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        const cluster = await clusterUserTopics(userId)

        res.status(200).json({
            message: "Topic clusterd successfully",
            cluster
        })

    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}
