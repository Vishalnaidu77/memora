import { useContext } from "react"
import { authContext } from "../../context/AuthContext"
import { loginUser, registerUser } from "../services/auth.api"

const useAuth = () => {

    const { user, setUser, loading, setLoading, error, setError } = useContext(authContext)

    const handleLogin = async (email,password) => {
        setLoading(true)

        try {    
            const res = await loginUser(email, password)
            setUser(res.user)
            setLoading(false)
            return res.user
        } catch (err) {
            setError(err.message)
            throw err
        } finally{
            setLoading(false)
        }
    }

    const handleRegister = async (name, email, password) => {
        setLoading(true)
    
        try {
            const res = await registerUser(name, email, password)
            setUser(res.user)
            setLoading(false)
            return res.user
        } catch (err) {
            setError(err.message)
            throw err
        } finally{
            setLoading(false)
        }
    }

    return {
        handleLogin,
        user,
        loading, 
        setLoading,
        error,
        handleRegister
    }
}

export default useAuth;