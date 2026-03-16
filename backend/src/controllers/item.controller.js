import { itemModel } from "../models/item.model.js"

export async function saveItemController(req, res){
    const { url, title } = req.body
    console.log(url, title);
    

    if(!url || !title){
        return res.status(404).json({
            message: "Missing fields",
        })
    }

    const item = await itemModel.create({
        url: url,
        title: title
    })

    res.status(200).json({
        message: "Item saved successfully",
        item
    })
}

export async function getItemsController(req, res){
    const items = await itemModel.find()

    if(!items){
        return res.status(404).json({
            message: "Items not found"
        })
    }

    res.status(200).json({
        message: "Items fetched successfully",
        items
    })
}

export async function updateItemsController(req, res) {
    const { title, description, tags } = req.body
    const itemId = req.params.itemId

    const item = await itemModel.findOne({ itemId })

    if(!item){
        return res.status(400).json({
            message: "Item not valid."
        })
    }

    const updatedItem = await itemModel.findByIdAndUpdate(
        itemId,
        { title, description, tags },
        { new: true }
    )

    res.status(200).json({
        message: "Item updated",
        updatedItem
    })
}

export async function deleteItemsController(req, res) {
    const itemId = req.params.itemId

    const item = await itemModel.findOne({itemId})

    if(!item){
        return res.status(404).json({
            message: "Item not valid"
        })
    }

    await itemModel.findOneAndDelete({ itemId })

    res.status(200).json({
        message: "Item deleted",
        item
    })
}