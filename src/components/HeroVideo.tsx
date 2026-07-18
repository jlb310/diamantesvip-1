'use client'

import { useEffect, useRef } from 'react'
import { preload } from 'react-dom'

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // El poster es el LCP de la página: precargarlo con prioridad alta.
  preload('/videos/video-top-poster.webp', { as: 'image', fetchPriority: 'high' })

  // El video (1.1MB) se descarga recién cuando la página terminó de cargar,
  // para no competir con el LCP ni con la hidratación. Mientras, se ve el poster.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const start = () => {
      if (video.src) return
      video.src = '/videos/video-top.mp4'
      video.play().catch(() => {})
    }
    if (document.readyState === 'complete') {
      start()
    } else {
      window.addEventListener('load', start, { once: true })
      return () => window.removeEventListener('load', start)
    }
  }, [])

  return (
    <section className="relative overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
      {/* Video background (src se setea post-load) */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster="/videos/video-top-poster.webp"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Centered content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white font-serif italic tracking-wide mb-3 drop-shadow-lg">
          Diamantes Vip
        </h1>
        <p className="text-white/90 text-base md:text-lg font-light tracking-wider max-w-xl mx-auto drop-shadow-md">
          El directorio más exclusivo de acompañantes en Chile
        </p>
      </div>
    </section>
  )
}
