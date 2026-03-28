'use client'

import React, { useEffect } from 'react'
import GraphNodes from './Components/GraphNodes'
import useItem from '../hooks/useItem'

const page = () => {

    const { graph, handleKnowledgeGraph } = useItem()

  return (
    <div>
      Graph
      <GraphNodes 
        graph={graph} 
        handleKnowledgeGraph={handleKnowledgeGraph}
    />
    </div>
  )
}

export default page
