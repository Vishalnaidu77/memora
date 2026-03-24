'use client'

import { createContext, useEffect, useState } from "react";
import { getCurrentUser } from "../app/services/auth.api";

export const authContext = createContext()

const AuthProvider = ({ children }) => {

    const [ user, setUser ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        let isMounted = true;

        const restoreUser = async () => {
            try {
                setLoading(true)
                const res = await getCurrentUser()

                if (isMounted) {
                    setUser(res.user ?? null)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setUser(null)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        restoreUser()

        return () => {
            isMounted = false;
        }
    }, []);

    return(
        <authContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
            {children}
        </authContext.Provider>
    )
}

export default AuthProvider
