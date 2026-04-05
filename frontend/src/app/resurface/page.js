'use client'

import React, { useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import useItem from '../hooks/useItem'
import ResurfaceCard from './components/ResurfaceCard'

const ResurfacePage = () => {
    const { theme } = useTheme()

    const { resurfaceItems, handleResurfaceItems, loading } = useItem()

    useEffect(() => {
        handleResurfaceItems()
    }, [])


  return (
    <main
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-[1600px] px-6 py-8 pb-10 md:px-8">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div>
            <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
              RECURSIVE MEMORY
            </p>
            <h1 className="mt-6 text-[clamp(4rem,9vw,6.8rem)] font-black leading-[0.9] tracking-[-0.08em]">
              RESURFACE
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8" style={{ color: theme.hint }}>
              These are older items from your archive that are ready to return to focus. Memora is
              bringing back materials that are at least a few days old and still worth revisiting.
            </p>
          </div>
        </div>

        <div className="mt-20">
          {loading ? (
            <div className="py-24 text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
              LOADING RESURFACED ITEMS...
            </div>
          ) : resurfaceItems.length ? (
            <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 2xl:grid-cols-4">
              {resurfaceItems.map((item, index) => (
                <ResurfaceCard
                  key={item?._id || item?.id || `${item?.title || "item"}-${index}`}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex min-h-[320px] flex-col items-center justify-center text-center"
              style={{
                border: `1px dashed ${theme.lowBorder}`,
                backgroundColor: theme.panelInner,
              }}
            >
              <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                NOTHING TO RESURFACE
              </p>
              <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                Keep saving items to your library. Older entries will appear here once they are ready
                to be revisited.
              </p>
            </div>
          )}
        </div>

        <footer
          className="mt-24 border-t pt-8 text-[11px] tracking-[0.32em]"
          style={{ borderColor: theme.lowBorder, color: theme.muted }}
        >
          2024 MEMORA. ALL RIGHTS RESERVED.
        </footer>
      </section>
    </main>
  )
}

export default ResurfacePage
