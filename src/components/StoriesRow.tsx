'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { StoryViewer, type StoryEscort } from '@/components/StoryViewer'
import { webpUrl } from '@/lib/webp'

interface StoriesRowProps {
  escorts: StoryEscort[]
}

// Carrusel con scroll nativo (sin clones ni transform): cada item se renderiza
// UNA vez — antes se triplicaba la lista para el loop infinito y todo eso se
// hidrataba también en móvil.
export function StoriesRow({ escorts }: StoriesRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (escorts.length === 0) return null

  const scrollByDir = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 3 * 140, behavior: 'smooth' })
  }

  const openViewer = (index: number) => {
    setSelectedIndex(index)
    setViewerOpen(true)
  }

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

        <div className="relative">
          {/* Flechas solo en desktop */}
          <button onClick={() => scrollByDir(-1)} className="hidden md:flex absolute -left-4 top-[44px] z-20 w-10 h-10 rounded-full glass shadow-lg items-center justify-center hover:border-accent/50 transition-all" aria-label="Anteriores">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scrollByDir(1)} className="hidden md:flex absolute -right-4 top-[44px] z-20 w-10 h-10 rounded-full glass shadow-lg items-center justify-center hover:border-accent/50 transition-all" aria-label="Siguientes">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-1 snap-x"
          >
            {escorts.map((escort, index) => (
              <button
                key={escort.id}
                onClick={() => openViewer(index)}
                className="flex flex-col items-center gap-1.5 md:gap-2 flex-shrink-0 group snap-start"
              >
                <div className="relative w-[88px] h-[88px] md:w-[116px] md:h-[116px]">
                  <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-accent via-accent-light to-rose-soft" />
                  <div className="absolute inset-0 rounded-full bg-surface m-[3px]" />
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    {escort.mainPhoto && escort.mainPhoto.startsWith('http') ? (
                      <Image src={webpUrl(escort.mainPhoto, 240)} alt={escort.alias || escort.name} fill sizes="116px" unoptimized className="object-cover md:group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="text-3xl md:text-4xl">💎</span></div>
                    )}
                  </div>
                </div>
                <span className="text-xs md:text-sm text-muted md:group-hover:text-brand transition-colors max-w-[88px] md:max-w-[116px] truncate font-medium">{escort.alias || escort.name}</span>
                <span className="text-[10px] md:text-xs text-muted-light -mt-1 max-w-[88px] md:max-w-[116px] truncate">{escort.city}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewerOpen && (
        <StoryViewer escorts={escorts} initialIndex={selectedIndex} onClose={() => setViewerOpen(false)} />
      )}
    </>
  )
}
