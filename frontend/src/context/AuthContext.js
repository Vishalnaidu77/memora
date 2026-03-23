'use client'

import { createContext, useState } from "react";

export const authContext = createContext()

const AuthProvider = ({ children }) => {

    const [ user, setUser ] = useState(null)
    const [ loading, setLoading ] = useState(null)
    const [ error, setError ] = useState(null)

    return(
        <authContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
            {children}
        </authContext.Provider>
    )
}

export default AuthProvider