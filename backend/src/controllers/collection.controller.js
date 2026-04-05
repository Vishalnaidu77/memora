import mongoose from "mongoose"
import { collectionModel } from "../models/collections.model.js"
import { itemModel } from "../models/item.model.js"

function getUserId(req) {
    return req?.user?.id ? new mongoose.Types.ObjectId(req.user.id) : null
}

function buildCountMap(rows) {
    return rows.reduce((map, row) => {
        map.set(String(row._id), row.count)
        return map
    }, new Map())
}

export async function createCollectionController(req, res) {
    try {
        const userId = getUserId(req)
        const { name, description, color, icon } = req.body
        const normalizedName = String(name || "").trim()

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        if (!normalizedName) {
            return res.status(400).json({
                message: "Collection name is required"
            })
        }

        const collection = await collectionModel.create({
            userId,
            name: normalizedName,
            description: String(description || "").trim(),
            color: color || "#3B82F6",
            icon: icon || ""
        })

        res.status(201).json({
            message: "Create collection successfully",
            collection: {
                ...collection.toObject(),
                itemCount: 0
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export async function getCollectionController(req, res) {
    try {
        const userId = getUserId(req)

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        const [collections, collectionCounts] = await Promise.all([
            collectionModel.find({ userId }).sort({ createdAt: -1 }).lean(),
            itemModel.aggregate([
                {
                    $match: {
                        userId,
                        collectionId: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$collectionId",
                        count: { $sum: 1 }
                    }
                }
            ])
        ])

        const countMap = buildCountMap(collectionCounts)
        const hydratedCollections = collections.map((collection) => ({
            ...collection,
            itemCount: countMap.get(String(collection._id)) || 0
        }))

        res.status(200).json({
            message: "Collection fetched",
            collections: hydratedCollections
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export async function getSingleCollectionController(req, res) {
    try {
        const userId = getUserId(req)
        const collectionId = req.params.collectionId

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        const collection = await collectionModel.findOne({ _id: collectionId, userId }).lean()

        if (!collection) {
            return res.status(404).json({
                message: "Collection not found"
            })
        }

        const items = await itemModel.find({ userId, collectionId }).sort({ createdAt: -1 })

        res.status(200).json({
            message: `Collection ${collectionId} fetched`,
            collection: {
                ...collection,
                items,
                itemCount: items.length
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export async function updateCollectionController(req, res) {
    try {
        const userId = getUserId(req)
        const collectionId = req.params.collectionId
        const { name, description, color, icon } = req.body
        const updates = {}

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
            const normalizedName = String(name || "").trim()

            if (!normalizedName) {
                return res.status(400).json({
                    message: "Collection name is required"
                })
            }

            updates.name = normalizedName
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
            updates.description = String(description || "").trim()
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "color")) {
            updates.color = color || "#3B82F6"
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "icon")) {
            updates.icon = icon || ""
        }

        const collection = await collectionModel.findOneAndUpdate(
            { _id: collectionId, userId },
            updates,
            { new: true }
        ).lean()

        if (!collection) {
            return res.status(404).json({
                message: "Collection not found"
            })
        }

        const itemCount = await itemModel.countDocuments({ userId, collectionId })

        res.status(200).json({
            message: "Collection Updated",
            collection: {
                ...collection,
                itemCount
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export async function deleteCollectionController(req, res) {
    try {
        const userId = getUserId(req)
        const collectionId = req.params.collectionId

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        const collection = await collectionModel.findOneAndDelete({ _id: collectionId, userId })

        if (!collection) {
            return res.status(404).json({
                message: "Collection not found"
            })
        }

        await itemModel.updateMany(
            { userId, collectionId: collection._id },
            { $set: { collectionId: null } }
        )

        res.status(200).json({
            message: "Collection deleted"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}
