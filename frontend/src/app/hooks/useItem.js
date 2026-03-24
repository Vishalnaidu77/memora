'use client'

import { ItemContext } from "../../context/ItemContext";
import { useContext } from "react";
import { getItems, saveItem } from "../services/items.api";

const useItem = () => {

    const { items, loading, setItems, setLoading, allItems, setAllItems } = useContext(ItemContext)

    const handleSaveItem = async (url) =>{
        setLoading(true)

        try {
            const res = await saveItem(url)
            setItems(res.items)
            setLoading(false)
        } catch(err){
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleGetItems = async () => {
        setLoading(true)

        try {
            const res = await getItems()
            setAllItems(prevItem => [...prevItem, res.items])
            setLoading(false)
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }

    }

    return {
        items,
        loading,
        setItems,
        setLoading,
        handleSaveItem,
        handleGetItems
    }
}

export default useItem;