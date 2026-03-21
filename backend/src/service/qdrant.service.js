import {QdrantClient} from '@qdrant/js-client-rest';

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

export async function initCollection(){
    try{
        const collection = await client.getCollection("items");
        if(!collection){
            await client.createCollection("items", {
                vectors: { 
                    size: 384, 
                    distance: "Cosine"
                }
            })
        }
        console.log(collection);
        
    } catch(err){
        console.log(err.message);
        throw err
    }
}
    
// export async function storeVector(itemId, vector, payload){
//     const points = [];
    
//     points.push({
//         id: itemId,
//         vector: vector,
//         payload: payload
//     })

//     await client.upsert("items", { points })
// }

// export async function searchSimilar(vector, userId, limit = 5){
//     try{
//         const result = await client.query("items", {
//             query: {
//                 text: vector.text,
//                 model: "sentence-tranformers/all-MiniLM-L6-v2"
//             },
//             with_payload: true,
//             limit: 5
//         })

//         return result
//     } catch(err){
//         throw err
//     }
// }