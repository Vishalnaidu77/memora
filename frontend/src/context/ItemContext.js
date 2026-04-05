'use client'
import { createContext, useState } from "react";

export const ItemContext = createContext()

const ItemProvider = ({ children }) => {

    const [items, setItems] = useState(null)
    const [loading, setLoading] = useState(false)
    const [allItems, setAllItems] = useState([])
    const [resurfaceItems, setResurfaceItems] = useState([])
    const [clusterGroups, setClusterGroups] = useState([])
    const [collections, setCollections] = useState([])
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
    const [ graph, setGraph ] = useState(null)

    return(
        <ItemContext.Provider value={{ 
            items, 
            loading, 
            setItems, 
            setLoading, 
            allItems, 
            setAllItems, 
            resurfaceItems, 
            setResurfaceItems,
            clusterGroups,
            setClusterGroups,
            collections,
            setCollections,
            isAddItemModalOpen,
            setIsAddItemModalOpen,
            graph,
            setGraph
        }}>
            { children }
        </ItemContext.Provider>
    )
}

export default ItemProvider
