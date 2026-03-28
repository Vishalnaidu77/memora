import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3001/api/item",
    withCredentials: true
})

export async function saveItem(url, file){

    const formData = new FormData()
    if (url) {
        formData.append("url", url)
    }

    if (file) {
        formData.append("file", file)
        formData.append("title", file.name || "Uploaded file")
    }

    const res = await api.post("/save", formData)
    return res.data
}

export async function getItems() {
    const res = await api.get("/get-item")
    return res.data
}

export async function getResurfaceItems() {
    const res = await api.get("/resurface")
    return res.data
}

export async function getClusters() {
    const res = await api.get("/clusters")
    return res.data
}

export async function generateClusters() {
    const res = await api.post("/cluster-topics")
    return res.data
}

export async function deleteItem(itemId) {
    const res = await api.delete(`/delete/${itemId}`)
    return res.data
}

export async function knowledgeGraph() {
    const res = await api.get("/graph")
    return res.data
}