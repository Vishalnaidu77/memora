'use client'

import React from 'react'
import GraphNodes from './Components/GraphNodes'
import useItem from '../hooks/useItem'
import { useTheme } from '../ThemeContext'

const page = () => {
    const { theme } = useTheme()
    const { graph, handleKnowledgeGraph } = useItem()
    const nodeCount = graph?.nodes?.length || 0
    const edgeCount = graph?.edges?.length || 0
    const density = nodeCount > 1 ? Math.round((edgeCount / nodeCount) * 100) / 100 : 0

  return (
    <main
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-[1600px] px-6 py-8 pb-12 md:px-8">
        <div
          className="relative overflow-hidden rounded-[2rem] border px-6 py-8 md:px-10 md:py-10"
          style={{
            borderColor: theme.lowBorder,
            background: `linear-gradient(135deg, ${theme.panelOuter}, ${theme.panelInner})`,
            boxShadow: `0 24px 80px ${theme.shadow}`,
          }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                theme.background === '#000000'
                  ? 'radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 28%), linear-gradient(115deg, transparent 0%, transparent 44%, rgba(255,255,255,0.05) 44%, rgba(255,255,255,0.05) 46%, transparent 46%, transparent 100%)'
                  : 'radial-gradient(circle at top left, rgba(0,0,0,0.08), transparent 28%), linear-gradient(115deg, transparent 0%, transparent 44%, rgba(0,0,0,0.04) 44%, rgba(0,0,0,0.04) 46%, transparent 46%, transparent 100%)'
            }}
          />
          <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div>
              <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                KNOWLEDGE GRAPH
              </p>
              <h1
                className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl"
                style={{ color: theme.heading, fontFamily: "'Manrope', sans-serif" }}
              >
                A living field of how your saved ideas connect.
              </h1>
              <p className="mt-6 max-w-2xl text-sm md:text-base" style={{ color: theme.hint }}>
                Each node is an item in your archive. Each edge marks a semantic relationship discovered from the embeddings behind your library.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Nodes" value={nodeCount} theme={theme} />
              <StatCard label="Edges" value={edgeCount} theme={theme} />
              <StatCard label="Density" value={density} theme={theme} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <GraphNodes
            graph={graph}
            handleKnowledgeGraph={handleKnowledgeGraph}
          />
        </div>
      </section>
    </main>
  )
}

export default page

function StatCard({ label, value, theme }) {
  return (
    <div
      className="rounded-[1.5rem] border px-4 py-5"
      style={{
        borderColor: theme.lowBorder,
        backgroundColor: theme.inputBg,
      }}
    >
      <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
        {label.toUpperCase()}
      </p>
      <p
        className="mt-3 text-3xl font-black tracking-tight"
        style={{ color: theme.heading, fontFamily: "'Manrope', sans-serif" }}
      >
        {value}
      </p>
    </div>
  )
}
