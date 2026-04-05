'use client'

import Button from '../../components/Button';
import SelectInput from '../../components/SelectInput';
import { useTheme } from '../../ThemeContext';
import TextInput from '../../components/TextInput'
import React, { useEffect, useRef, useState } from 'react'
import useItem from '../../hooks/useItem';
import { IoClose } from "react-icons/io5";

const FormContainer = ({ onClose, onSaveResult }) => {

    const [ url, setUrl] = useState("")
    const [ file, setFile ] = useState(null)
    const [ collectionId, setCollectionId ] = useState("")
    const initialCollectionsLoadRef = useRef(false)

    const { theme } = useTheme();
    const { collections, loading, handleGetCollections, handleGetItems, handleSaveItem } = useItem()

    useEffect(() => {
        if (initialCollectionsLoadRef.current) return

        initialCollectionsLoadRef.current = true

        if (!collections?.length) {
            handleGetCollections().catch((error) => {
                console.error("Failed to load custom clusters for add item modal", error)
            })
        }
    }, [collections?.length, handleGetCollections])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await handleSaveItem(url, file, collectionId || null);
        await Promise.allSettled([handleGetItems(), handleGetCollections()])
        onSaveResult?.(result)
        setUrl("")
        setFile(null)
        setCollectionId("")
        onClose?.()
    }

  return (
    <main
      className="fixed top-0 left-0 flex justify-center items-center z-30 h-full w-full"
      style={{
        backgroundColor: theme.panelOuter/10,
        color: theme.foreground,
        border: `1px solid ${theme.lowBorder}`,
        boxShadow: `0 24px 80px ${theme.shadow}`,
        backdropFilter: "blur(10px)",
      }}
    >
        <div 
            className="form-container w-[min(92vw,560px)] px-5 py-6 md:px-8 md:py-8"
            style={{
                backgroundColor: theme.panelOuter,
                color: theme.foreground,
                border: `1px solid ${theme.lowBorder}`,
                boxShadow: `0 24px 80px ${theme.shadow}`,
                backdropFilter: "blur(10px)",
            }}
            >
            <span className='absolute right-5 top-5 cursor-pointer' onClick={onClose}>
                <IoClose 
                    style={{ height: "25px", width: "25px"}}
                />
            </span>
            <div className="mb-8">
                <p
                className="text-[11px] tracking-[0.34em]"
                style={{ color: theme.muted }}
                >
                ADD TO LIBRARY
                </p>
                <h2
                className="mt-4 text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[0.95] tracking-[-0.05em]"
                style={{ color: theme.heading }}
                >
                Capture a new object.
                </h2>
                <p
                className="mt-4 max-w-md text-sm leading-7"
                style={{ color: theme.hint }}
                >
                Upload a file or add a URL and let Memora process it into your archive.
                </p>
            </div>

            <form className="space-y-6">
                <TextInput 
                    id="file"
                    label="PDF / Image"
                    type="file"
                    name="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    theme={theme}
                    accept=".pdf,image/*"
                />
                <TextInput
                    id="url"
                    label="URL"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter url"
                    theme={theme}   
                    />
                <SelectInput
                    id="collection"
                    label="Custom Cluster"
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    theme={theme}
                >
                    <option value="">No custom cluster</option>
                    {collections.map((collection) => (
                        <option key={collection?._id} value={collection?._id}>
                            {collection?.name}
                        </option>
                    ))}
                </SelectInput>

                {/* Submit */}
                <div className="pt-6">
                <Button
                    theme={theme}
                    variant="auth"
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Submiting..." : "Submit"}
                </Button>
                </div>
            </form>
        </div>
    </main>
  )
}

export default FormContainer
