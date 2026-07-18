'use client'

import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const TOGGLES = [
  {
    key: 'verificada',
    label: 'Verificada',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    key: 'vip',
    label: 'Diamante VIP',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    key: 'domicilio',
    label: 'Domicilio',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'tatuajes',
    label: 'Con Tatuajes',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
  },
  {
    key: 'piercings',
    label: 'Con Piercings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'depto',
    label: 'Depto Propio',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

function SearchBarContent({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [q, setQ] = useState('')
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set())

  // Read current URL params when opening
  useEffect(() => {
    if (isOpen && searchParams) {
      setQ(searchParams.get('q') || '')
      const toggles = searchParams.get('toggles')?.split(',') || []
      setActiveToggles(new Set(toggles))
      // Focus input after opening
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, searchParams])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navigate = useCallback(
    (newQ: string, newToggles: Set<string>) => {
      const params = new URLSearchParams()
      if (newQ) params.set('q', newQ)
      if (newToggles.size > 0) {
        params.set('toggles', Array.from(newToggles).join(','))
      }
      const qs = params.toString()
      router.push(qs ? `/?${qs}` : '/')
      onClose()
    },
    [router, onClose]
  )

  const toggleFilter = (key: string) => {
    const next = new Set(activeToggles)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setActiveToggles(next)
  }

  const removeTag = (key: string) => {
    const next = new Set(activeToggles)
    next.delete(key)
    setActiveToggles(next)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q, activeToggles)
  }

  const activeChips = TOGGLES.filter((t) => activeToggles.has(t.key))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal panel - light pink background */}
      <div className="absolute top-0 left-0 right-0 bg-[#fae0e6] shadow-2xl border-b border-[#f2d0d8] animate-in">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-brand font-serif italic tracking-[0.02em]">
              Busca Diamante por ciudad, físico o servicio
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fdf2f5]/80 text-muted hover:text-brand hover:bg-[#fdf2f5] transition-all"
              aria-label="Cerrar búsqueda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search input */}
          <form onSubmit={handleSearch}>
            <div className="bg-[#fdf2f5] border border-[#f2d0d8] focus-within:border-[#db7581] focus-within:shadow-[0_0_0_3px_rgba(219,117,129,0.12)] rounded-xl px-5 py-3.5 flex flex-wrap items-center gap-2 transition-all duration-300 shadow-sm">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 bg-[#db7581]/10 border border-[#db7581]/20 text-[#db7581] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  <span>{chip.icon}</span>
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
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={activeChips.length === 0 ? 'Busca por ciudad, nacionalidad, físico, servicios...' : ''}
                className="flex-1 min-w-[180px] bg-transparent text-brand outline-none placeholder:text-muted-light text-base py-2 font-light"
              />

              <button
                type="submit"
                className="text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg flex-shrink-0 flex items-center gap-2 font-medium text-sm"
                style={{ backgroundColor: '#db7581' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c5636f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#db7581')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </form>

          {/* Toggle pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-muted-light uppercase tracking-wider font-medium mr-2 pt-1.5">
              Filtros:
            </span>
            {TOGGLES.map((toggle) => {
              const active = activeToggles.has(toggle.key)
              if (active) return null
              return (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => toggleFilter(toggle.key)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border bg-[#fdf2f5]/70 border-[#f2d0d8] text-muted hover:border-[#db7581]/40 hover:text-[#db7581] hover:bg-[#db7581]/5"
                >
                  <span>{toggle.icon}</span>
                  {toggle.label}
                </button>
              )
            })}
          </div>

          {/* Hint text */}
          <p className="text-xs text-muted-light mt-4">
            Puedes buscar por: ciudad, nacionalidad, color de cabello, tipo de cuerpo, servicios y más.
          </p>
        </div>
      </div>
    </div>
  )
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  return (
    <Suspense fallback={null}>
      <SearchBarContent isOpen={isOpen} onClose={onClose} />
    </Suspense>
  )
}
