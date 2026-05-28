'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TOGGLES = [
  {
    key: 'video',
    label: 'Con Video',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  {
    key: 'cara',
    label: 'Cara Visible',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    key: 'experiencias',
    label: 'Con Experiencias',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    key: 'disponible',
    label: 'Disponible ahora',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'promocion',
    label: 'En Promoción',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
]

interface SearchBarProps {
  initialQ?: string
  initialToggles?: string[]
}

export function SearchBar({ initialQ = '', initialToggles = [] }: SearchBarProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set(initialToggles))

  const navigate = useCallback(
    (newQ: string, newToggles: Set<string>) => {
      const params = new URLSearchParams()
      if (newQ) params.set('q', newQ)
      if (newToggles.size > 0) {
        params.set('toggles', Array.from(newToggles).join(','))
      }
      const qs = params.toString()
      router.push(qs ? `/home?${qs}` : '/home')
    },
    [router]
  )

  const toggleFilter = (key: string) => {
    const next = new Set(activeToggles)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setActiveToggles(next)
    navigate(q, next)
  }

  const removeTag = (key: string) => {
    const next = new Set(activeToggles)
    next.delete(key)
    setActiveToggles(next)
    navigate(q, next)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q, activeToggles)
  }

  const activeChips = TOGGLES.filter((t) => activeToggles.has(t.key))

  return (
    <section className="relative overflow-hidden flex items-center min-h-[320px]">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/video-top.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* VS-style glass content panel */}
      <div className="relative z-10 w-full">
        <div className="max-w-[95%] xl:max-w-6xl mx-auto px-4 py-6">
          {/* Glass panel — floating luxury card */}
          <div className="glass-luxe rounded-sm p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-brand font-serif italic tracking-[0.02em] mb-4">
              Busca scort y acompanante por ciudad o servicio
            </h2>

            <form onSubmit={handleSearch}>
              <div className="bg-surface border border-border-light focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(175,80,113,0.08)] rounded-sm px-5 py-3 flex flex-wrap items-center gap-2 transition-all duration-300">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  >
                    <span className="text-accent">{chip.icon}</span>
                    {chip.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTag(chip.key)
                      }}
                      className="ml-0.5 hover:text-brand transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={activeChips.length === 0 ? 'Scort en Santiago, acompanante VIP, masajes...' : ''}
                  className="flex-1 min-w-[180px] bg-transparent text-brand outline-none placeholder:text-muted-light text-base py-2 font-light"
                />

                <button
                  type="submit"
                  className="text-white px-4 py-2.5 rounded-sm transition-all duration-300 hover:shadow-lg flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: '#db7581' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c5636f')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#db7581')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Toggle pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {TOGGLES.map((toggle) => {
                const active = activeToggles.has(toggle.key)
                if (active) return null
                return (
                  <button
                    key={toggle.key}
                    type="button"
                    onClick={() => toggleFilter(toggle.key)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border bg-surface/60 backdrop-blur-sm border-border/60 text-muted-light hover:border-accent/40 hover:text-accent hover:bg-accent/5"
                  >
                    <span>{toggle.icon}</span>
                    {toggle.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
