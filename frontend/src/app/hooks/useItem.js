'use client'

import { ItemContext } from "../../context/ItemContext";
import { useCallback, useContext } from "react";
import { createCollection, getCollections } from "../services/collections.api";
import { deleteItem, generateClusters, getClusters, getItems, getResurfaceItems, knowledgeGraph, saveItem, updateItem } from "../services/items.api";

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
        collections,
        setCollections,
        graph, 
        setGraph
    } = useContext(ItemContext)

    const handleSaveItem = async (url, file, collectionId) =>{
        setLoading(true)

        try {
            const res = await saveItem(url, file, collectionId)
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

    const handleGetCollections = async () => {
        setLoading(true)

        try {
            const res = await getCollections()
            setCollections(res.collections ?? [])
            return res.collections ?? []
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCollection = async (payload) => {
        setLoading(true)

        try {
            const res = await createCollection(payload)
            setCollections((prev) => [res.collection, ...prev])
            return res.collection
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateItem = async (itemId, payload) => {
        setLoading(true)

        try {
            const res = await updateItem(itemId, payload)
            const updatedItem = res.updatedItem ?? null

            if (updatedItem) {
                setAllItems((prev) =>
                    prev.map((item) =>
                        String(item?._id || item?.id) === String(updatedItem?._id || updatedItem?.id)
                            ? updatedItem
                            : item
                    )
                )
            }

            return updatedItem
        } catch (err) {
            throw err
        } finally {
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
        collections,
        handleGetCollections,
        handleCreateCollection,
        handleGetClusters,
        handleGenerateClusters,
        handleDeleteItem,
        handleUpdateItem,
        graph,
        handleKnowledgeGraph
    }
}

export default useItem;
