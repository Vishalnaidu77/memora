import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3001/api/item"
})

export async function saveItem(url){
    const res = await api.post("/save", {
        url
    })
    return res.data
}

export async function getItems() {
    const res = await api.get("/get-item")
    return res.data
}