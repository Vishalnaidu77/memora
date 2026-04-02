'use client'

import { ItemContext } from "../../context/ItemContext";
import { useCallback, useContext, useEffect } from "react";
import { deleteItem, generateClusters, getClusters, getItems, getResurfaceItems, knowledgeGraph, saveItem } from "../services/items.api";

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
        setClusterGroups, 
        graph, 
        setGraph
    } = useContext(ItemContext)

    const handleSaveItem = async (url, file) =>{
        setLoading(true)

        try {
            const res = await saveItem(url, file)
            setItems(res.item ?? null)
            return res
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

    const handleDeleteItem = async (itmeId) => {
        setLoading(true)

        try {
            const res = await deleteItem(itmeId)
            setLoading(false)
            return res.deletedItem
        } catch (err) {
            throw err
        } finally{
            setLoading(false)
        }
    }

    const handleKnowledgeGraph = useCallback(async () => {
        setLoading(true)

        try {
            const res = await knowledgeGraph()
            setGraph(res.graph)
            return res.graph
        } catch (err) {
            throw err
        } finally{
            setLoading(false)
        }
    }, [setGraph, setLoading])

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
        handleGenerateClusters,
        handleDeleteItem,
        graph,
        handleKnowledgeGraph
    }
}

export default useItem;
