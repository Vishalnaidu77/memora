import mongoose from "mongoose";
import { itemModel } from "../models/item.model.js"
import { fetchMatadata } from "../service/metadata.service.js";
import { generateEmbedding } from "../service/ai.service.js";
import { getUserVectors, searchSimilar } from "../service/qdrant.service.js";
import { uploadFile } from "../service/supabse.service.js";
import { randomUUID } from "crypto";
import { extractTextFromImage, extractTextFromPdf } from "../service/file.processor.js";
import { clusterUserTopics } from "../service/topic.service.js";
import {
    buildContentFingerprint,
    buildSourceFingerprint,
    findExactDuplicate
} from "../service/duplicate.service.js";
import { enqueueItemEnrichment } from "../service/queue.service.js";
import { scheduleItemEnrichment } from "../service/item-processing.service.js";

const MAX_HIGHLIGHT_LENGTH = 5000

function normalizeItemUrl(url) {
    if (!url || typeof url !== "string") {
        return null
    }

    try {
        const parsed = new URL(url.trim())
        parsed.hash = ""
        parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/"
        return parsed.toString()
    } catch {
        return null
    }
}

function buildUrlCandidates(url) {
    const candidates = new Set()

    if (!url || typeof url !== "string") {
        return []
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
        return []
    }

    candidates.add(trimmedUrl)

    const normalizedUrl = normalizeItemUrl(trimmedUrl)
    if (normalizedUrl) {
        candidates.add(normalizedUrl)

        try {
            const parsed = new URL(normalizedUrl)

            if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
                parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/"
                candidates.add(parsed.toString())
            } else if (parsed.pathname !== "/") {
                parsed.pathname = `${parsed.pathname}/`
                candidates.add(parsed.toString())
            }
        } catch {
            // Ignore candidate expansion when URL parsing fails.
        }
    }

    return [...candidates]
}

function normalizeHighlightValue(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim()
}

function buildHighlightPayload({ text, pageTitle, pageUrl, contextBefore, contextAfter }) {
    return {
        text: String(text || "").trim(),
        pageTitle: String(pageTitle || "").trim(),
        pageUrl: String(pageUrl || "").trim(),
        contextBefore: String(contextBefore || "").trim(),
        contextAfter: String(contextAfter || "").trim()
    }
}

function findDuplicateHighlight(item, highlightPayload) {
    const incomingText = normalizeHighlightValue(highlightPayload.text)
    const incomingPageUrl = normalizeHighlightValue(highlightPayload.pageUrl)
    const incomingBefore = normalizeHighlightValue(highlightPayload.contextBefore)
    const incomingAfter = normalizeHighlightValue(highlightPayload.contextAfter)

    return item.highlights.find((highlight) => {
        return normalizeHighlightValue(highlight.text) === incomingText
            && normalizeHighlightValue(highlight.pageUrl) === incomingPageUrl
            && normalizeHighlightValue(highlight.contextBefore) === incomingBefore
            && normalizeHighlightValue(highlight.contextAfter) === incomingAfter
    }) || null
}

export async function saveItemController(req, res) {
    try {
        const { url, title, contentType, collectionId } = req.body
        const id = req.user.id 
        const userId = new mongoose.Types.ObjectId(id)
        const uploadedFile = req.file
        const normalizedUrl = normalizeItemUrl(url)

        if (!url && !uploadedFile) {
            return res.status(400).json({ message: "A url or file is required" })
        }

        const sourceFingerprint = buildSourceFingerprint({
            url,
            fileBuffer: uploadedFile?.buffer
        })

        const sourceDuplicate = await findExactDuplicate({
            userId,
            sourceFingerprint
        })

        if (sourceDuplicate) {
            return res.status(200).json({
                message: "Item already saved",
                item: sourceDuplicate,
                duplicate: true
            })
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
        const contentFingerprint = buildContentFingerprint({
            title: finalTitle,
            description: finalDescription,
            content: finalContent
        })

        const contentDuplicate = await findExactDuplicate({
            userId,
            contentFingerprint
        })

        if (contentDuplicate) {
            return res.status(200).json({
                message: "Item already saved",
                item: contentDuplicate,
                duplicate: true
            })
        }

        const item = await itemModel.create({
            userId,
            url: url || null,
            normalizedUrl,
            title: finalTitle,
            description: finalDescription,
            image: meta.image || fileData?.fileUrl || (isDirectImageUrl(url) ? url : ''),
            siteName: meta.siteName || '',
            content: finalContent,
            contentType: resolvedContentType,
            collectionId: collectionId || null,
            file: fileData,
            sourceFingerprint,
            contentFingerprint,
            status: "queued"
        })

        scheduleItemEnrichment(item._id)
        enqueueItemEnrichment({ itemId: item._id, userId })
            .catch((queueError) => {
                console.warn(`Queue enqueue failed for item ${item._id}: ${queueError.message}`)
            })

        res.status(201).json({
            message: "Item saved and processing started",
            item
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
 
}

export async function addHighlightController(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const {
            text,
            pageTitle,
            pageUrl,
            contextBefore,
            contextAfter
        } = req.body

        const highlightText = String(text || "").trim()

        if (!pageUrl || typeof pageUrl !== "string") {
            return res.status(400).json({
                message: "Page url is required to save a highlight"
            })
        }

        if (!highlightText) {
            return res.status(400).json({
                message: "Highlight text is required"
            })
        }

        if (highlightText.length > MAX_HIGHLIGHT_LENGTH) {
            return res.status(400).json({
                message: `Highlight text must be ${MAX_HIGHLIGHT_LENGTH} characters or less`
            })
        }

        const lookupConditions = []
        const urlCandidates = buildUrlCandidates(pageUrl)
        const normalizedUrl = normalizeItemUrl(pageUrl)

        if (urlCandidates.length) {
            lookupConditions.push({ url: { $in: urlCandidates } })
        }

        if (normalizedUrl) {
            lookupConditions.push({ normalizedUrl })
        }

        if (!lookupConditions.length) {
            return res.status(400).json({
                message: "Invalid page url"
            })
        }

        const item = await itemModel.findOne({
            userId,
            $or: lookupConditions
        }).sort({ createdAt: -1 })

        if (!item) {
            return res.status(404).json({
                message: "Save this page to Memora before adding highlights"
            })
        }

        const highlightPayload = buildHighlightPayload({
            text: highlightText,
            pageTitle,
            pageUrl,
            contextBefore,
            contextAfter
        })

        const duplicateHighlight = findDuplicateHighlight(item, highlightPayload)

        if (duplicateHighlight) {
            return res.status(200).json({
                message: "Highlight already saved",
                duplicate: true,
                highlight: duplicateHighlight,
                itemId: item._id
            })
        }

        const updatedItem = await itemModel.findByIdAndUpdate(
            item._id,
            {
                $push: {
                    highlights: {
                        $each: [highlightPayload],
                        $position: 0
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        )

        res.status(201).json({
            message: "Highlight saved successfully",
            highlight: updatedItem?.highlights?.[0] || highlightPayload,
            itemId: item._id
        })
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

function isDirectImageUrl(url) {
    if (!url) return false

    try {
        const parsed = new URL(url)
        return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(parsed.pathname)
    } catch {
        return false
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

export async function getGraphDataController(req, res) {
    try {
        const userId = req.user.id
        
        const items = await itemModel.find({userId})
        const qdrantItem = await getUserVectors(userId)
        
        const vectorMap = {}
        qdrantItem.forEach(points => {
            vectorMap[points.payload.mongoId] = points.vector
        })

        const nodes = items.map(item => ({
            id: item._id.toString(),
            title: item.title,
            tags: item.tags,
            image: item.image,
            contentType: item.contentType
        }))

        const nodeIds = new Set(nodes.map(node => node.id))

        const edges = []
        for (const item of items){
            const vector = vectorMap[item._id.toString()]
            if (!vector) continue
              
            const relatedIds = await searchSimilar(vector, userId, 3)
  
            relatedIds.forEach(relatedId => {
                const sourceId = item._id.toString()
                const targetId = relatedId.toString()

                if(sourceId !== targetId && nodeIds.has(targetId)){
  
                    const exist = edges.find(e => 
                        (e.source === sourceId && e.target === targetId) ||
                        (e.source === targetId && e.target === sourceId)
                    )
                    if (!exist) {
                        edges.push({
                            source: sourceId,
                            target: targetId
                        })
                    }
                }
            })   
        }
        
        res.status(200).json({
            message: "Fetch similar items",
            graph: {
                nodes,
                edges
            }
        })
    } catch (err) {
        return res.status(400).json({ message : err.message })
    }
}   
