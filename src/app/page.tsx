'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) video.play().catch(() => {})
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 -z-20 w-full h-full object-cover"
      >
        <source src="/videos/video_age.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 -z-30 bg-[url('/logo-cuadrado.jpeg')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-10 bg-black/25" />

      <div className="w-full max-w-[300px] rounded-[38px] bg-[#e9a1b2]/95 shadow-[0_20px_50px_rgba(60,24,38,0.30)] px-6 py-8">
        <div className="flex flex-col items-center gap-5">
          <Image
            src="/logo_diamantes_pronto.png"
            alt="Diamantes VIP pronto"
            width={220}
            height={320}
            className="w-full max-w-[220px] h-auto"
            priority
          />
          <p
            className="text-center text-white/95 text-3xl tracking-wide font-bold"
          >
            Pronto...
          </p>
        </div>
      </div>
    </div>
  )
}
