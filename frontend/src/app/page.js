'use client'

import { useContext, useState } from "react"
import useItem from "./hooks/useItem"

const Home = () => {

  const [ url, setUrl ] = useState("")
  const [ title, setTitle ] = useState("")

  const { items, loading, handleSaveItem } = useItem()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    handleSaveItem(url, title)  
    console.log(items);
    setUrl("")

  }

  return(
    <main className="main-page h-screen w-full flex justify-center items-center bg-background text-foreground">
      <div className="form-container border border-foreground/20 rounded-xl p-6">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <input
           type="text" 
           name="url" 
           placeholder="Enter URL" 
           value={url}
           onChange={(e) => setUrl(e.target.value)}
           className="border rounded-lg py-2 px-4 hover:border-2 transition duration-300 ease"
          />
          <button
            type="submit"
            className="bg-background text-foreground border border-foreground/40 rounded-lg py-2 px-4 hover:bg-foreground hover:text-background transition duration-300 ease"
          >
            Save item
          </button>
        </form>
      </div>
    </main>
  )
}

export default Home