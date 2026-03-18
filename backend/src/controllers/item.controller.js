import { itemModel } from "../models/item.model.js"

export async function saveItemController(req, res) {
    try {
        const { url, title, contentType, collectionId } = req.body
        const userId = req.userId  // auth middleware se aaya

        if (!url || !title) {
            return res.status(400).json({ message: "url and title required" })
        }

        const item = await itemModel.create({
            userId,
            url,
            title,
            contentType: contentType || 'other',
            collectionId: collectionId || null
        })

        res.status(201).json({ message: "Item saved", item })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getItemsController(req, res) {
    try {
        const userId = req.userId  // sirf is user ke items

        const items = await itemModel.find({ userId }).sort({ createdAt: -1 })

        res.status(200).json({ message: "Items fetched", items })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function updateItemsController(req, res) {
    try {
        const { title, description, tags } = req.body
        const itemId = req.params.itemId
        const userId = req.userId

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
        const userId = req.userId

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