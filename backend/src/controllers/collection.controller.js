import { collectionModel } from "../models/collections.model.js"

export async function createCollectionController(req, res){
    const { name, description, icon } = req.body

    const collection = await collectionModel.create({
        name,
        description,
    })

    if(!collection){
        return res.status(400).json({
            message: "Fields cannot be empty"
        })
    }

    res.status(200).json({
        message: "Create collection successfully",
        collection
    })
}


export async function getCollectionController(req, res){
    const collections = await collectionModel.find()

    if(!collections){
        return res.status(400).json({
            message: "There is no collections, please create one"
        })
    }

    res.status(200).json({
        message: "Collection fetched",
        collections
    })
}

export async function getSingleCollectionController(req, res){
    const collectionId = req.params.collectionId
    const collection = await collectionModel.findOne({ _id: collectionId })

    console.log(collectionId);

    if(!collection){
        return res.status(404).json({
            message: "Collection not found"
        })
    }

    res.status(200).json({
        message: `Collection ${collectionId} fetched`,
        collection
    })
}

export async function updateCollectionController(req, res) {
    const { name, description } = req.body
    const collectionId = req.params.collectionId

    const collection = await collectionModel.findOne({ _id: collectionId })

    if(!collection){
        return res.status(404).json({
            message: "Collection not found"
        })
    }

    await collectionModel.findByIdAndUpdate(collectionId, {
        name: name,
        description: description
    })

    res.status(200).json({
        message: "Collection Updated",
        collection
    })
}

export async function deleteCollectionController(req, res) {
    const collectionId = req.params.collectionId
    await collectionModel.findOneAndDelete({collectionId})

    res.status(200).json({
        message: "Collection deleted"
    })
}