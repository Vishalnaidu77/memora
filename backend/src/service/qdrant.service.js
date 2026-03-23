import {QdrantClient} from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid'

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

export async function initCollection() {
    try {
        await client.getCollection("items")
        console.log("Collection Exists")
    } catch (err) {
        await client.createCollection("items", {
            vectors: {
                size: 768,
                distance: "Cosine"
            }
        })
        console.log("Collection created")
    }

    try {
        await client.createPayloadIndex("items", {
            field_name: "userId",
            field_schema: "keyword"
        })
        console.log("Payload index created")
    } catch (err) {
        console.log("Index already exists — skipping")
    }
}
    
export async function storeVector(itemId, vector, payload, userId){
    try {
        const points = {
            id: uuidv4(),
            vector: vector,
            payload: {
                ...payload,
                mongoId: itemId.toString(),
                userId: userId.toString()
            },
        }

        // Qdrant expects points as an array
        await client.upsert("items", { points: [points] })
        return points.id

    } catch (err) {
        console.log("Qdrant store failed:", err.message);
        throw err
    }
}

export async function searchSimilar(vector, userId, limit = 5){
    try{
        const result = await client.search("items", {
            vector: vector,
            filter: {
                must: [{
                    key: "userId",
                    match: { value: userId.toString() }
                }]
            },
            limit: limit,
            with_payload: true,
            score_threshold: 0.5
        })

        return result.map(r => r.payload.mongoId)
    } catch(err){
        console.log("Qdrant search failed:", err.message);
        return []
    }
}