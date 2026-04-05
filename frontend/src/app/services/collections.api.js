import axios from "axios"

const api = axios.create({
    baseURL: "https://memora-8xw8.onrender.com/api/collections",
    withCredentials: true
})

export async function getCollections() {
    const res = await api.get("/")
    return res.data
}

export async function getCollectionById(collectionId) {
    const res = await api.get(`/${collectionId}`)
    return res.data
}

export async function createCollection(payload) {
    const res = await api.post("/create", payload)
    return res.data
}
