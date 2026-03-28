'use client'

import React, { useEffect } from 'react'
import * as d3 from 'd3'

const GraphNodes = ({ graph, handleKnowledgeGraph }) => {

    useEffect(() => {
        handleKnowledgeGraph()
    }, [])

    graph && console.log(graph);

    const simulation = d3.forceSimulation(graph?.nodes)
    console.log(simulation);

  return (
    <div className='h-64 w-64 bg-white text-black'>
      Graphnodes
    </div>
  )
}

export default GraphNodes
