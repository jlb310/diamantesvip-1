'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { webpUrl } from '@/lib/webp'

interface Short {
  id: string
  url: string
  thumbnail: string | null
  escortName: string
  escortCity: string
  escortPhoto: string | null
}

interface ShortsRowProps {
  shorts: Short[]
}

const VISIBLE_COUNT = 5
const CARD_WIDTH = 236
const GAP = 16
const STEP = CARD_WIDTH + GAP

function ShortCard({ short, isActive }: { short: Short; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || videoError) return
    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      video.pause()
      video.currentTime = 0
      setPlaying(false)
    }
  }, [isActive, videoError])

  const handlePlayClick = () => {
    const video = videoRef.current
    if (!video) return
    if (playing) {
      video.pause()
      setPlaying(false)
    } else {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const posterUrl = webpUrl(short.thumbnail || short.escortPhoto || undefined) || undefined

  return (
    <div className="relative aspect-[9/16] flex-shrink-0 rounded-sm overflow-hidden bg-surface-container border border-border group" style={{ width: CARD_WIDTH }}>
      {!videoError ? (
        <video
          ref={videoRef}
          src={short.url}
          poster={posterUrl}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      ) : null}

      {/* Fallback poster / background */}
      {(videoError || !playing) && posterUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      {/* Play / Pause overlay */}
      <button
        onClick={handlePlayClick}
        className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-lg">
          {playing ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </div>
      </button>

      {/* Always-visible play indicator when paused */}
      {!playing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}

      <button onClick={(e) => { e.stopPropagation(); setMuted(!muted) }} className="absolute top-3 right-3 z-20 glass-dark rounded-full p-2.5 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        {muted ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        )}
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand/80 via-brand/40 to-transparent pt-16 pb-3 px-3 z-10">
        <div className="flex items-center gap-2">
          {short.escortPhoto && short.escortPhoto.startsWith('http') && (
            <div className="w-7 h-7 rounded-full overflow-hidden border border-border flex-shrink-0 relative">
              <Image src={webpUrl(short.escortPhoto)} alt={short.escortName} fill sizes="28px" unoptimized className="object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{short.escortName}</p>
            <p className="text-white/70 text-[10px]">{short.escortCity}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ShortsRow({ shorts }: ShortsRowProps) {
  // Triple the array for seamless infinite loop
  const loopItems = [...shorts, ...shorts, ...shorts]
  const baseCount = shorts.length
  const [scrollIndex, setScrollIndex] = useState(baseCount)
  const containerWidth = VISIBLE_COUNT * CARD_WIDTH + (VISIBLE_COUNT - 1) * GAP

  const scrollTo = useCallback((index: number) => {
    setScrollIndex(index)
  }, [])
  
  const next = () => scrollTo(scrollIndex + 1)
  const prev = () => scrollTo(scrollIndex - 1)
  
  // Handle infinite loop wrapping
  useEffect(() => {
    if (scrollIndex >= baseCount * 2) {
      // Wrapped past the end — jump back to start of middle copy
      const timer = setTimeout(() => {
        setScrollIndex(scrollIndex - baseCount)
      }, 400)
      return () => clearTimeout(timer)
    }
    if (scrollIndex < baseCount) {
      // Wrapped before the start — jump forward to end of middle copy
      const timer = setTimeout(() => {
        setScrollIndex(scrollIndex + baseCount)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [scrollIndex, baseCount])

  if (shorts.length === 0) return null

  return (
    <div className="pt-10 pb-6">
      <div className="flex items-center gap-3 mb-4 px-4 md:px-0">
        <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        <h2 className="text-xl md:text-2xl font-bold text-brand font-serif italic">Últimos Shorts</h2>
      </div>

      {/* Mobile: scrollable row */}
      <div className="md:hidden px-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {shorts.map((short) => (
            <ShortCard key={short.id} short={short} isActive={false} />
          ))}
        </div>
      </div>

      {/* Desktop: carousel with arrows */}
      <div className="hidden md:block relative" style={{ width: containerWidth }}>
        <button onClick={prev} className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass shadow-lg border border-border flex items-center justify-center hover:border-accent/50 transition-all">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={next} className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass shadow-lg border border-border flex items-center justify-center hover:border-accent/50 transition-all">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="overflow-hidden rounded-sm">
          <div className="flex transition-transform duration-400 ease-out" style={{ gap: GAP, transform: `translateX(-${scrollIndex * STEP}px)` }}>
            {loopItems.map((short, i) => (
              <ShortCard key={`${short.id}-${i}`} short={short} isActive={i >= scrollIndex && i < scrollIndex + VISIBLE_COUNT} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
