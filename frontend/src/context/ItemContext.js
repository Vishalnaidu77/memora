'use client'
import { createContext, useState } from "react";

export const ItemContext = createContext()

const ItemProvider = ({ children }) => {

    const [items, setItems] = useState(null)
    const [loading, setLoading] = useState(false)
    const [allItems, setAllItems] = useState([])

    return(
        <ItemContext.Provider value={{ items, loading, setItems, setLoading, allItems, setAllItems }}>
            { children }
        </ItemContext.Provider>
    )
}

export default ItemProvider