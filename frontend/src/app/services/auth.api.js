import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001/api/auth",
    withCredentials: true
})

export async function loginUser(email, password){
    const res = await api.post("/login", {
        email,
        password
    })
    return res.data
}

export async function registerUser(name, email, password) {
    const res = await api.post("/register",{
        name,
        email,
        password
    })
    return res.data
}