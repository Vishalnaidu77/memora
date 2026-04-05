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
const SEARCH_SCORE_THRESHOLD = 0.55
const RELATED_ITEMS_SCORE_THRESHOLD = 0.65
const GRAPH_CANDIDATE_SCORE_THRESHOLD = 0.56
const GRAPH_RECIPROCAL_EDGE_SCORE_THRESHOLD = 0.67
const GRAPH_STRONG_EDGE_SCORE_THRESHOLD = 0.82
const GRAPH_EDGE_LIMIT = 6
const GRAPH_STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "the",
    "to",
    "for",
    "of",
    "on",
    "in",
    "with",
    "by",
    "from",
    "what",
    "is",
    "how",
    "learn",
    "guide",
    "tutorial",
    "docs",
    "documentation",
    "quick",
    "start",
    "introduction",
    "official",
    "getting",
    "started"
])

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
            contentType || meta.contentType || uploadedFile?.mimetype,
            { url }
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

function resolveContentType(mimeType, options = {}) {
    const normalizedType = typeof mimeType === "string" ? mimeType.toLowerCase() : ""
    const normalizedUrl = options.url?.toLowerCase?.() || ""

    if (normalizedType === "twitter") return "tweet"
    if (['article', 'tweet', 'image', 'video', 'pdf', 'file', 'other'].includes(normalizedType)) {
        return normalizedType
    }
    if (normalizedType === 'application/pdf') return 'pdf'
    if (normalizedType.startsWith('image/')) return 'image'
    if (normalizedType.startsWith('video/')) return 'video'
    if (normalizedUrl) {
        if (/(youtube\.com|youtu\.be|vimeo\.com|loom\.com)/.test(normalizedUrl)) {
            return 'video'
        }
        if (/(twitter\.com|x\.com)/.test(normalizedUrl)) {
            return 'tweet'
        }
        if (/\.(pdf)(\?|#|$)/.test(normalizedUrl)) {
            return 'pdf'
        }
        if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/.test(normalizedUrl)) {
            return 'image'
        }
        return 'article'
    }
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

function tokenizeGraphText(value) {
    return new Set(
        String(value || "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .map((token) => token.trim())
            .filter((token) => token.length > 1 && !GRAPH_STOP_WORDS.has(token))
    )
}

function tokenizeGraphUrl(url) {
    if (!url) {
        return new Set()
    }

    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, "")
        const path = parsed.pathname || ""
        return tokenizeGraphText(`${host} ${path}`)
    } catch {
        return new Set()
    }
}

function buildGraphSignals(item) {
    const titleTokens = tokenizeGraphText(item.title)
    const tagTokens = tokenizeGraphText((item.tags || []).join(" "))
    const siteTokens = tokenizeGraphText(item.siteName)
    const urlTokens = tokenizeGraphUrl(item.normalizedUrl || item.url)

    return {
        titleTokens,
        tagTokens,
        siteTokens,
        urlTokens,
        allTokens: new Set([
            ...titleTokens,
            ...tagTokens,
            ...siteTokens,
            ...urlTokens
        ])
    }
}

function countTokenOverlap(leftSet, rightSet) {
    let count = 0

    leftSet.forEach((token) => {
        if (rightSet.has(token)) {
            count += 1
        }
    })

    return count
}

function computeGraphLexicalBoost(sourceSignals, targetSignals, sourceItem, targetItem) {
    if (!sourceSignals || !targetSignals) {
        return 0
    }

    const sharedAll = countTokenOverlap(sourceSignals.allTokens, targetSignals.allTokens)
    const sharedTitle = countTokenOverlap(sourceSignals.titleTokens, targetSignals.titleTokens)
    const sharedTag = countTokenOverlap(sourceSignals.tagTokens, targetSignals.tagTokens)
    const sharedSite = countTokenOverlap(sourceSignals.siteTokens, targetSignals.siteTokens)
    const sharedUrl = countTokenOverlap(sourceSignals.urlTokens, targetSignals.urlTokens)

    let boost = 0

    if (sharedAll >= 1) boost += 0.06
    if (sharedAll >= 2) boost += 0.05
    if (sharedTitle >= 1) boost += 0.08
    if (sharedTag >= 1) boost += 0.05
    if (sharedSite >= 1 || sharedUrl >= 1) boost += 0.07

    const sourceTitle = String(sourceItem?.title || "").toLowerCase()
    const targetTitle = String(targetItem?.title || "").toLowerCase()
    const docLikePattern = /\b(docs?|documentation|guide|quick start|getting started)\b/

    if (
        docLikePattern.test(sourceTitle)
        || docLikePattern.test(targetTitle)
    ) {
        if (sharedTitle >= 1 || sharedSite >= 1 || sharedUrl >= 1) {
            boost += 0.05
        }
    }

    return Number(Math.min(boost, 0.22).toFixed(4))
}

export async function getItemsController(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const items = await itemModel.find({ userId })

        items
            .filter((item) => !String(item.summary || "").trim())
            .slice(0, 10)
            .forEach((item) => {
                scheduleItemEnrichment(item._id)
                enqueueItemEnrichment({ itemId: item._id, userId })
                    .catch((queueError) => {
                        console.warn(`Queue enqueue failed for item ${item._id}: ${queueError.message}`)
                    })
            })

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
        const userId = new mongoose.Types.ObjectId(req.user.id)
    
        const item = await itemModel.findOne({ _id: itemId, userId })

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

        const similarResults = await searchSimilar(embeddings, userId, {
            limit: 5,
            scoreThreshold: SEARCH_SCORE_THRESHOLD
        })
        const mongoIds = similarResults.map(result => result.mongoId)
        console.log("Mongo id", similarResults);


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

        const similarResults = await searchSimilar(embeddings, userId, {
            limit: 5,
            scoreThreshold: RELATED_ITEMS_SCORE_THRESHOLD
        })
        const filteredIds = similarResults
            .map(result => result.mongoId)
            .filter(id => id !== itemId)
        console.log("mongo ID", similarResults);
        
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
        const itemMap = new Map(items.map(item => [item._id.toString(), item]))
        const signalMap = new Map(
            items.map(item => [item._id.toString(), buildGraphSignals(item)])
        )

        const similarityMap = new Map()
        for (const item of items){
            const vector = vectorMap[item._id.toString()]
            if (!vector) continue

            const sourceId = item._id.toString()
            const relatedResults = await searchSimilar(vector, userId, {
                limit: GRAPH_EDGE_LIMIT,
                scoreThreshold: GRAPH_CANDIDATE_SCORE_THRESHOLD
            })

            similarityMap.set(
                sourceId,
                relatedResults
                    .map((result) => {
                        const targetId = result.mongoId?.toString()

                        if (!targetId || targetId === sourceId || !nodeIds.has(targetId)) {
                            return null
                        }

                        const lexicalBoost = computeGraphLexicalBoost(
                            signalMap.get(sourceId),
                            signalMap.get(targetId),
                            itemMap.get(sourceId),
                            itemMap.get(targetId)
                        )
                        const hybridScore = Number(
                            Math.min((result.score || 0) + lexicalBoost, 0.99).toFixed(4)
                        )

                        return {
                            ...result,
                            mongoId: targetId,
                            lexicalBoost,
                            hybridScore
                        }
                    })
                    .filter(Boolean)
            )
        }

        const edgeMap = new Map()

        similarityMap.forEach((matches, sourceId) => {
            matches.forEach((match) => {
                const targetId = match.mongoId.toString()
                const reciprocalMatch = similarityMap.get(targetId)?.find(
                    (candidate) => candidate.mongoId.toString() === sourceId
                )

                const currentHybridScore = match.hybridScore || 0
                const reciprocalHybridScore = reciprocalMatch?.hybridScore || 0
                const isStrongOneWayMatch = currentHybridScore >= GRAPH_STRONG_EDGE_SCORE_THRESHOLD
                const isReciprocalMatch = Boolean(
                    reciprocalMatch
                    && currentHybridScore >= GRAPH_RECIPROCAL_EDGE_SCORE_THRESHOLD
                    && reciprocalHybridScore >= GRAPH_RECIPROCAL_EDGE_SCORE_THRESHOLD
                )

                if (!isStrongOneWayMatch && !isReciprocalMatch) {
                    return
                }

                const edgeKey = [sourceId, targetId].sort().join(":")

                if (!edgeMap.has(edgeKey)) {
                    edgeMap.set(edgeKey, {
                        source: sourceId,
                        target: targetId,
                        score: Number(Math.max(currentHybridScore, reciprocalHybridScore).toFixed(4))
                    })
                }
            })
        })

        const edges = [...edgeMap.values()]
        
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
