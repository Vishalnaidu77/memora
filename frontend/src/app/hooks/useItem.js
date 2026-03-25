'use client'

import { ItemContext } from "../../context/ItemContext";
import { useContext } from "react";
import { generateClusters, getClusters, getItems, getResurfaceItems, saveItem } from "../services/items.api";

const useItem = () => {

    const {
        items,
        loading,
        setItems,
        setLoading,
        allItems,
        setAllItems,
        resurfaceItems,
        setResurfaceItems,
        clusterGroups,
        setClusterGroups
    } = useContext(ItemContext)

    const handleSaveItem = async (url, file) =>{
        setLoading(true)

        try {
            const res = await saveItem(url, file)
            setItems(res.item ?? null)
            return res.item
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
            setAllItems(res.items ?? [])
            setLoading(false)
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }

    }

    const handleResurfaceItems = async () => {
        setLoading(true)

        try {
            const res = await getResurfaceItems()
            setResurfaceItems(res.items ?? [])
            return res.items ?? []
        } catch (err) {
            throw err
        } finally{
            setLoading(false)
        }

    }

    const handleGetClusters = async () => {
        setLoading(true)

        try {
            const res = await getClusters()
            setClusterGroups(res.clusters ?? [])
            return res.clusters ?? []
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateClusters = async () => {
        setLoading(true)

        try {
            await generateClusters()
            const res = await getClusters()
            setClusterGroups(res.clusters ?? [])
            return res.clusters ?? []
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
        setAllItems,
        handleSaveItem,
        handleGetItems,
        allItems,
        resurfaceItems, 
        setResurfaceItems,
        handleResurfaceItems,
        clusterGroups,
        setClusterGroups,
        handleGetClusters,
        handleGenerateClusters
    }
}

export default useItem;
