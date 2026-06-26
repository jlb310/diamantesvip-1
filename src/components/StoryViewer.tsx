'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface VideoData {
  url: string
  thumbnail: string | null
}

export interface StoryEscort {
  id: string
  alias: string | null
  name: string
  city: string
  mainPhoto: string | null
  videos: VideoData[]
}

interface StoryViewerProps {
  escorts: StoryEscort[]
  initialIndex: number
  onClose: () => void
}

function ProgressBar({
  active,
  completed,
  onComplete,
}: {
  active: boolean
  completed: boolean
  onComplete: () => void
}) {
  const [progress, setProgress] = useState(0)
  const animRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!active || completed) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }

    const start = performance.now()
    const duration = 7000

    const animate = (now: number) => {
      const elapsed = now - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)

      if (pct < 100) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [active, completed, onComplete])

  return (
    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full transition-all duration-100"
        style={{
          width: completed ? '100%' : `${progress}%`,
          opacity: completed ? 0.4 : 1,
        }}
      />
    </div>
  )
}

export function StoryViewer({ escorts, initialIndex, onClose }: StoryViewerProps) {
  const [escortIndex, setEscortIndex] = useState(initialIndex)
  const [videoIndex, setVideoIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const currentEscort = escorts[escortIndex]
  const currentVideo = currentEscort?.videos[videoIndex]

  const goToNext = useCallback(() => {
    if (videoIndex < currentEscort.videos.length - 1) {
      setVideoIndex((v) => v + 1)
      setPaused(false)
    } else if (escortIndex < escorts.length - 1) {
      setEscortIndex((e) => e + 1)
      setVideoIndex(0)
      setPaused(false)
    } else {
      onClose()
    }
  }, [videoIndex, currentEscort, escortIndex, escorts.length, onClose])

  const goToPrev = useCallback(() => {
    if (videoIndex > 0) {
      setVideoIndex((v) => v - 1)
      setPaused(false)
    } else if (escortIndex > 0) {
      const prevEscort = escorts[escortIndex - 1]
      setEscortIndex((e) => e - 1)
      setVideoIndex(prevEscort.videos.length - 1)
      setPaused(false)
    }
  }, [videoIndex, escortIndex, escorts])

  // Auto advance when video ends
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => goToNext()
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [goToNext, escortIndex, videoIndex])

  // Pause/resume video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (paused) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [paused, escortIndex, videoIndex])

  // Load new video
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentVideo) return
    setLoading(true)
    video.load()
    video.play().catch(() => {})
    const handleCanPlay = () => setLoading(false)
    video.addEventListener('canplay', handleCanPlay)
    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [currentVideo])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    setPaused(false)

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goToPrev()
      else goToNext()
    }
  }

  const handleClick = (side: 'left' | 'right') => {
    if (side === 'left') goToPrev()
    else goToNext()
  }

  if (!currentEscort || !currentVideo) {
    onClose()
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-4 pb-2 glass-dark/50">
        {currentEscort.videos.map((_, i) => (
          <ProgressBar
            key={i}
            active={!paused && i === videoIndex}
            completed={i < videoIndex}
            onComplete={goToNext}
          />
        ))}
      </div>

      {/* Header */}
      <div className="glass-dark absolute top-10 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3">
        <span className="text-white font-bold text-sm">
          {currentEscort.alias || currentEscort.name}
        </span>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Video */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading && (
          <div className="absolute z-10">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          src={currentVideo.url}
          className="w-full h-full object-contain"
          playsInline
          preload="auto"
          muted={false}
        />
      </div>

      {/* Tap zones */}
      <div className="absolute inset-0 z-10 flex">
        <div className="w-1/2 h-full" onClick={() => handleClick('left')} />
        <div className="w-1/2 h-full" onClick={() => handleClick('right')} />
      </div>

      {/* Pause indicator */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200"
        style={{ opacity: paused ? 1 : 0 }}
      >
        <div className="w-16 h-16 rounded-full glass-dark flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
