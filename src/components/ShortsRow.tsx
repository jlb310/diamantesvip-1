'use client'

import { useState, useRef } from 'react'
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

const CARD_WIDTH = 236
const GAP = 16
const STEP = CARD_WIDTH + GAP

// El <video> solo se monta cuando el usuario da play: evita hidratar/descargar
// decenas de videos que nadie está viendo (antes: 64 <video> con preload).
function ShortCard({ short }: { short: Short }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [wantsPlay, setWantsPlay] = useState(false)
  const mountVideo = wantsPlay && !videoError

  const handlePlayClick = () => {
    const video = videoRef.current
    if (!video) {
      setWantsPlay(true)
      return
    }
    if (playing) {
      video.pause()
      setPlaying(false)
    } else {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const posterUrl = webpUrl(short.thumbnail || short.escortPhoto || undefined, 480) || undefined

  return (
    <div className="relative aspect-[9/16] flex-shrink-0 rounded-sm overflow-hidden bg-surface-container border border-border group snap-start" style={{ width: CARD_WIDTH }}>
      {mountVideo ? (
        <video
          ref={videoRef}
          src={short.url}
          poster={posterUrl}
          muted={muted}
          autoPlay
          loop
          playsInline
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : null}

      {/* Poster (lazy: solo se descarga al entrar al viewport) */}
      {(videoError || !playing) && posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="236px"
          unoptimized
          loading="lazy"
          className="object-cover"
        />
      )}

      {/* Play / Pause overlay */}
      <button
        onClick={handlePlayClick}
        className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={playing ? 'Pausar' : 'Reproducir'}
      >
        <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-lg">
          {playing ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </div>
      </button>

      {/* Indicador de play siempre visible cuando está pausado */}
      {!playing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}

      <button onClick={(e) => { e.stopPropagation(); setMuted(!muted) }} className="absolute top-3 right-3 z-20 glass-dark rounded-full p-2.5 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity" aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
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
              <Image src={webpUrl(short.escortPhoto, 96)} alt={short.escortName} fill sizes="28px" unoptimized className="object-cover" />
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

// Carrusel con scroll nativo (sin clones ni transform): cada short se renderiza
// UNA vez — antes la lista se triplicaba para el loop infinito.
export function ShortsRow({ shorts }: ShortsRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (shorts.length === 0) return null

  const scrollByDir = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * STEP, behavior: 'smooth' })
  }

  return (
    <div className="pt-10 pb-6">
      <div className="flex items-center gap-3 mb-4 px-4 md:px-0">
        <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        <h2 className="text-xl md:text-2xl font-bold text-brand font-serif italic">Últimos Shorts</h2>
      </div>

      <div className="relative">
        {/* Flechas solo en desktop */}
        <button onClick={() => scrollByDir(-1)} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass shadow-lg border border-border items-center justify-center hover:border-accent/50 transition-all" aria-label="Anteriores">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => scrollByDir(1)} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass shadow-lg border border-border items-center justify-center hover:border-accent/50 transition-all" aria-label="Siguientes">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div ref={scrollerRef} className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 px-4 md:px-0 snap-x rounded-sm">
          {shorts.map((short) => (
            <ShortCard key={short.id} short={short} />
          ))}
        </div>
      </div>
    </div>
  )
}
