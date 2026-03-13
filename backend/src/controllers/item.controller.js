import { itemModel } from "../models/item.model.js"

export async function itemController(req, res){
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