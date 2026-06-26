'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { StoryViewer, type StoryEscort } from '@/components/StoryViewer'
import { webpUrl } from '@/lib/webp'

interface StoriesRowProps {
  escorts: StoryEscort[]
}

const VISIBLE_COUNT = 5
const ITEM_WIDTH = 140
const GAP = 24
const STEP = ITEM_WIDTH + GAP

export function StoriesRow({ escorts }: StoriesRowProps) {
  const [scrollIndex, setScrollIndex] = useState(escorts.length)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const baseCount = escorts.length
  const loopItems = [...escorts, ...escorts, ...escorts]

  const scrollTo = useCallback((index: number) => {
    setScrollIndex(index)
  }, [])

  const next = () => scrollTo(scrollIndex + 3)
  const prev = () => scrollTo(scrollIndex - 3)

  useEffect(() => {
    if (baseCount === 0) return
    if (scrollIndex >= baseCount * 2) {
      const timer = setTimeout(() => setScrollIndex(scrollIndex - baseCount), 400)
      return () => clearTimeout(timer)
    }
    if (scrollIndex < baseCount) {
      const timer = setTimeout(() => setScrollIndex(scrollIndex + baseCount), 400)
      return () => clearTimeout(timer)
    }
  }, [scrollIndex, baseCount])

  const openViewer = (realIndex: number) => {
    setSelectedIndex(realIndex % baseCount)
    setViewerOpen(true)
  }

  if (escorts.length === 0) return null

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h2 className="text-xl md:text-2xl font-display text-brand">Últimas Historias</h2>
        </div>

        {/* Mobile: native horizontal scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {escorts.map((escort, index) => (
            <button key={`${escort.id}-m-${index}`} onClick={() => openViewer(index)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="relative w-[88px] h-[88px]">
                <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-accent via-accent-light to-rose-soft" />
                <div className="absolute inset-0 rounded-full bg-surface m-[3px]" />
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  {escort.mainPhoto && escort.mainPhoto.startsWith('http') ? (
                    <Image src={webpUrl(escort.mainPhoto)} alt={escort.alias || escort.name} fill sizes="88px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="text-3xl">💎</span></div>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted max-w-[88px] truncate font-medium">{escort.alias || escort.name}</span>
              <span className="text-[10px] text-muted-light -mt-1 max-w-[88px] truncate">{escort.city}</span>
            </button>
          ))}
        </div>

        {/* Desktop: carousel with arrows */}
        <div className="hidden md:block relative">
          <button onClick={prev} className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass shadow-lg flex items-center justify-center hover:border-accent/50 transition-all">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass shadow-lg flex items-center justify-center hover:border-accent/50 transition-all">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="overflow-hidden py-2 px-1 -mx-1">
            <div className="flex transition-transform duration-400 ease-out" style={{ gap: GAP, transform: `translateX(-${scrollIndex * STEP}px)` }}>
              {loopItems.map((escort, index) => (
                <button key={`${escort.id}-${index}`} onClick={() => openViewer(index)} className="flex flex-col items-center gap-2 flex-shrink-0 group" style={{ width: ITEM_WIDTH - GAP }}>
                  <div className="relative w-[116px] h-[116px]">
                    <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-accent via-accent-light to-rose-soft" />
                    <div className="absolute inset-0 rounded-full bg-surface m-[3px]" />
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      {escort.mainPhoto && escort.mainPhoto.startsWith('http') ? (
                        <Image src={webpUrl(escort.mainPhoto)} alt={escort.alias || escort.name} fill sizes="116px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="text-4xl">💎</span></div>
                      )}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                  </div>
                  <span className="text-sm text-muted group-hover:text-brand transition-colors max-w-[116px] truncate font-medium">{escort.alias || escort.name}</span>
                  <span className="text-xs text-muted-light -mt-1 max-w-[116px] truncate">{escort.city}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {viewerOpen && (
        <StoryViewer escorts={escorts} initialIndex={selectedIndex} onClose={() => setViewerOpen(false)} />
      )}
    </>
  )
}
