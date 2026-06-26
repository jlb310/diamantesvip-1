'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DailyPoint {
  date: string
  count: number
}

interface VisitStats {
  total: number
  today: number
  last7: number
  last30: number
  uniqueTotal: number
  daily: DailyPoint[]
}

export default function MisVisitasPage() {
  const router = useRouter()
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/admin/login')
      return
    }
    fetch('/api/diamante/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setStats(d.stats || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const cards: { label: string; value: number; accent?: boolean }[] = [
    { label: 'Visitas totales', value: stats?.total ?? 0, accent: true },
    { label: 'Hoy', value: stats?.today ?? 0 },
    { label: 'Últimos 7 días', value: stats?.last7 ?? 0 },
    { label: 'Últimos 30 días', value: stats?.last30 ?? 0 },
    { label: 'Visitantes únicos', value: stats?.uniqueTotal ?? 0 },
  ]

  const daily = stats?.daily ?? []
  const maxCount = Math.max(1, ...daily.map((d) => d.count))

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-accent hover:text-accent-hover mb-6 inline-block text-sm transition-colors">
        ← Volver al panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-display text-brand mb-1">Mis visitas</h1>
        <p className="text-muted-light text-sm uppercase tracking-[0.06em]">Estadísticas de tu perfil público</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="glass-float rounded-sm p-5">
            <div className={`text-3xl font-display mb-1 ${c.accent ? 'text-accent' : 'text-brand'}`}>
              {new Intl.NumberFormat('es-CL').format(c.value)}
            </div>
            <div className="text-[11px] text-muted-light uppercase tracking-[0.08em] leading-tight">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-float rounded-sm p-6">
        <h2 className="text-sm font-semibold text-brand uppercase tracking-[0.08em] mb-4">
          Visitas por día (últimos 30 días)
        </h2>
        <div className="flex items-end gap-1 h-40">
          {daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
              <div
                className="w-full bg-gradient-to-t from-accent/40 to-accent rounded-t-sm transition-all duration-300 hover:from-accent hover:to-brand"
                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
              />
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-brand text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {d.count} · {d.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-light">
          <span>{daily[0]?.date.slice(5) ?? ''}</span>
          <span>{daily[daily.length - 1]?.date.slice(5) ?? ''}</span>
        </div>
      </div>
    </div>
  )
}
