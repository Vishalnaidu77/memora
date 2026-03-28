'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useTheme } from '../../ThemeContext'

const GraphNodes = ({ graph, handleKnowledgeGraph }) => {
  const { theme } = useTheme()
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const hasFetchedRef = useRef(false)
  const [size, setSize] = useState({ width: 960, height: 560 })

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    handleKnowledgeGraph()
  }, [handleKnowledgeGraph])

  useEffect(() => {
    const measureGraph = () => {
      if (!containerRef.current) return

      const nextWidth = containerRef.current.clientWidth || 960
      const nextHeight = nextWidth < 768 ? 420 : 560
      setSize({ width: nextWidth, height: nextHeight })
    }

    measureGraph()
    window.addEventListener('resize', measureGraph)

    return () => window.removeEventListener('resize', measureGraph)
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (!graph?.nodes?.length) return

    const width = size.width
    const height = size.height
    const isMobile = width < 768
    const nodeRadius = (d) => (d.tags?.length > 3 ? 11 : 8)
    const labelOffset = 14
    const labelMaxWidth = isMobile ? 120 : 170
    const padding = isMobile ? 28 : 44

    const nodes = graph.nodes.map((d) => ({ ...d, id: d.id?.toString() }))
    const nodeIds = new Set(nodes.map((node) => node.id))
    const links = (graph.edges || [])
      .map((d) => ({
        ...d,
        source: d.source?.toString(),
        target: d.target?.toString()
      }))
      .filter((d) => nodeIds.has(d.source) && nodeIds.has(d.target))

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('display', 'block')
      .style('width', '100%')
      .style('height', '100%')

    const defs = svg.append('defs')
    const glow = defs
      .append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    glow
      .append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur')

    glow
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .join('feMergeNode')
      .attr('in', (d) => d)

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', theme.panelInner)

    const viewport = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.6, 2.5])
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform)
      })

    svg.call(zoom)

    const link = viewport
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', theme.divider)
      .attr('stroke-width', 1.1)
      .attr('stroke-opacity', 0.85)

    const node = viewport
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', theme.foreground)
      .attr('stroke', theme.background)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#node-glow)')
      .call(
        d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )

    node.append('title').text((d) => d.title || d.name || 'Untitled node')

    const label = viewport
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => {
        const value = d.title || d.name || 'Untitled'
        return value.length > 20 ? `${value.slice(0, 20)}...` : value
      })
      .attr('fill', theme.foreground)
      .attr('font-size', 11)
      .attr('font-family', "'Manrope', sans-serif")
      .attr('letter-spacing', '0.08em')
      .attr('dx', 14)
      .attr('dy', 4)
      .attr('pointer-events', 'none')

    label.each(function(d) {
      d.labelWidth = Math.min(this.getComputedTextLength(), labelMaxWidth)
    })

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(isMobile ? 72 : 110))
      .force('charge', d3.forceManyBody().strength(isMobile ? -140 : -220))
      .force('collide', d3.forceCollide().radius((d) => nodeRadius(d) + 18))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('center', d3.forceCenter(width / 2, height / 2))

    simulation.on('tick', () => {
      nodes.forEach((d) => {
        const radius = nodeRadius(d)
        const labelWidth = d.labelWidth || 0
        const minX = padding + radius
        const maxX = width - padding - radius - labelOffset - labelWidth
        const minY = padding + radius
        const maxY = height - padding - radius

        d.x = Math.max(minX, Math.min(maxX, d.x ?? width / 2))
        d.y = Math.max(minY, Math.min(maxY, d.y ?? height / 2))
      })

      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)

      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
    })

    function dragStarted(e, d) {
      e.sourceEvent?.stopPropagation()
      if(!e.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(e, d) {
      d.fx = e.x
      d.fy = e.y
    }

    function dragEnded(e, d) {
      if(!e.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => simulation.stop()
  }, [graph, size, theme])

  if (!graph?.nodes?.length) {
    return (
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[2rem] border p-8"
        style={{
          minHeight: '420px',
          borderColor: theme.lowBorder,
          background: `linear-gradient(145deg, ${theme.panelOuter}, ${theme.panelInner})`,
          boxShadow: `0 24px 80px ${theme.shadow}`,
        }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              modeGradient(theme.background, theme.foreground),
          }}
        />
        <div className="relative flex h-full min-h-[360px] flex-col justify-between">
          <div>
            <p className="text-[11px] tracking-[0.4em]" style={{ color: theme.muted }}>
              GRAPH FIELD
            </p>
            <h3
              className="mt-4 max-w-lg text-3xl font-black tracking-tight"
              style={{ color: theme.heading, fontFamily: "'Manrope', sans-serif" }}
            >
              Your knowledge map will appear here as soon as connected items are ready.
            </h3>
          </div>
          <p className="max-w-md text-sm" style={{ color: theme.hint }}>
            Save a few related memories, articles, or files and Memora will render their semantic links in this field.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[2rem] border"
      style={{
        minHeight: `${size.height}px`,
        borderColor: theme.lowBorder,
        background: `radial-gradient(circle at top, ${theme.panelOuter}, ${theme.panelInner} 55%, ${theme.background})`,
        boxShadow: `0 24px 80px ${theme.shadow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            modeGradient(theme.background, theme.foreground),
          opacity: 0.55,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background: `linear-gradient(180deg, ${theme.background}aa, transparent)`,
        }}
      />
      <svg ref={svgRef} />
    </div>
  )
}

export default GraphNodes

function modeGradient(background, foreground) {
  const color = background === '#000000'
    ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 44px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 44px), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.08), transparent 30%)'
    : 'repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 44px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 44px), radial-gradient(circle at 20% 20%, rgba(0,0,0,0.05), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.04), transparent 30%)'

  return color.replaceAll('255,255,255', foreground === '#ffffff' ? '255,255,255' : '0,0,0')
}
