'use client'

import { useTheme } from "../ThemeContext";

const CollectionPage = () => {
  const { theme } = useTheme();

  return (
    <main
      className="min-h-[calc(100vh-81px)] px-6 py-10 md:px-8"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <div
        className="mx-auto max-w-[1600px] rounded-2xl p-10"
        style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
      >
        <p className="text-[11px] tracking-[0.32em]" style={{ color: theme.muted }}>COLLECTION</p>
        <h1 className="mt-6 text-5xl font-black tracking-[-0.05em]" style={{ color: theme.heading }}>
          There is no collection yet.
        </h1>
        
      </div>
    </main>
  )
}

export default CollectionPage
