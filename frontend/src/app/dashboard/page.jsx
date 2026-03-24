'use client'

import { useEffect } from "react";
import Icon from "../components/Icon";
import useItem from "../hooks/useItem";

const WAVEFORM_HEIGHTS = [16, 24, 12, 20, 8, 24, 16, 8, 20, 12, 24, 16, 8];

const metadata = {
  title: "MEMORA | The Architecture of Cognitive Resonance",
};

export default function DashboardPage() {
    
    const { allItems, handleGetItems, loading, setLoading } = useItem()

    useEffect(() => {
        handleGetItems()
        console.log(allItems);
    }, [] )
    
    return (
    <main className="flex-1 bg-black text-white overflow-x-hidden">
      {/* Top Metadata Bar */}
      <div className="px-6 md:px-12 pt-6 md:pt-8 pb-8">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Neural Archives #1 9.4.2
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-6 md:px-12 mb-16">
        {/* Main Heading - Split across lines */}
        <h1 className="font-black uppercase leading-[0.9] mb-8" style={{ fontSize: "clamp(3rem, 12vw, 6rem)" }}>
          The<br />
          Architecture<br />
          Of<br />
          Cognitive<br />
          Resonance
        </h1>

        {/* Artifact Info */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-600 flex items-center justify-center text-xs font-bold">
              ET
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase">Artifact</p>
              <p className="text-[10px] text-gray-400">Elias Thomas</p>
            </div>
          </div>
          <span className="text-[10px] text-gray-500">Read Time: 15 Minutes</span>
        </div>
      </section>

      {/* Featured Waveform Area */}
      <section className="px-6 md:px-12 mb-16">
        <div className="w-full bg-gray-900 p-12 flex items-center justify-center min-h-64 rounded">
          <svg viewBox="0 0 1000 200" className="w-full h-full">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#888", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#444", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 0 100 Q 62.5 50, 125 100 T 250 100 T 375 100 T 500 100 T 625 100 T 750 100 T 875 100 T 1000 100"
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="3"
            />
          </svg>
        </div>
      </section>

      {/* Quote and Classifications */}
      <section className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Quote - Left Column */}
        <div className="md:col-span-1 border-l-4 border-gray-600 pl-6">
          <p className="text-sm italic text-gray-300 leading-relaxed">
            "The modern monolith does not just store data; it organizes the void between thoughts. In this exploration, we dissect how neural associations form the bedrock of emergent memory systems."
          </p>
        </div>

        {/* Classifications - Right Columns */}
        <div className="md:col-span-3 space-y-8">
          {/* Epistemology */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-4">
              Epistemology
            </span>
            <div className="flex flex-wrap gap-3">
              {["Structuralism", "Neural Design", "Archival Theory", "Neuronal Text"].map((tag) => (
                <span key={tag} className="bg-gray-900 text-[10px] font-bold uppercase px-3 py-2 border border-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Neural Associations */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-4">
              Neural Associations
            </span>
            <div className="space-y-3">
              <div className="flex gap-4">
                <span className="text-gray-600 font-bold text-xs">#1</span>
                <div>
                  <p className="text-xs font-bold">The Ritualized Grid and the Ethics of Order</p>
                  <p className="text-[10px] text-gray-500 mt-1">Related Concept: Foundational</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-600 font-bold text-xs">#2</span>
                <div>
                  <p className="text-xs font-bold">Channels vs Access: Hiding in Digital Spaces</p>
                  <p className="text-[10px] text-gray-500 mt-1">Related Concept: Layered</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-600 font-bold text-xs">#3</span>
                <div>
                  <p className="text-xs font-bold">Resonance Memory Patterns in AI Models</p>
                  <p className="text-[10px] text-gray-500 mt-1">Related Concept: Emergent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 md:px-12 mb-16 max-w-3xl">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">I. The Synaptic Interface</h2>
        <p className="text-sm text-gray-300 leading-relaxed mb-6">
          In the depths of the memory core, information is not stored in linear rows. Instead, it exists as a series of 
          interconnected nodes, each vibrating with the context of its neighbors. This "Modern Monolith" approach rejects 
          the hierarchy of the folder in favor of the fluidity of the association.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">
          Consider the way a scent can trigger a decade-old memory. Our LLM replicates this through tonal layering and 
          ambient shadows, creating a spatial environment where data feels three-dimensional. The use of pure black 
          (#000000) creates a void where only the essential is illuminated.
        </p>
      </section>

      {/* Resonance Frequency Chart */}
      <section className="px-6 md:px-12 mb-16">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Resonance Frequency</h3>
        <div className="w-full bg-gray-900 p-6 flex items-end justify-center gap-2 min-h-40 rounded">
          {[35, 55, 40, 60, 50, 65, 45].map((height, i) => (
            <div
              key={i}
              className="bg-gray-600 w-12 transition-all hover:bg-gray-500"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </section>

      {/* Bottom Cards Grid */}
      <section className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-gray-900 border border-gray-800 p-12 flex flex-col items-center justify-center min-h-56 hover:border-gray-600 transition-colors cursor-pointer rounded">
          <Icon name="hub" className="text-4xl text-gray-600 mb-4" />
          <h3 className="text-xs font-black uppercase tracking-wider text-center">Node Connection</h3>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-12 flex flex-col items-center justify-center min-h-56 hover:border-gray-600 transition-colors cursor-pointer rounded">
          <Icon name="integration_instructions" className="text-4xl text-gray-600 mb-4" />
          <h3 className="text-xs font-black uppercase tracking-wider text-center">Core Synthesis</h3>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 md:px-12 flex flex-col items-center gap-6 pb-32">
        <button className="px-12 py-3 bg-white text-black text-[10px] font-black uppercase tracking-wider hover:bg-gray-200 transition-colors">
          Download Archive
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
          Re-Index Neurons
        </span>
      </section>
    </main>
  );
}