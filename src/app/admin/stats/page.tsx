'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
  active: number
  verified: number
  featured: number
  photos: number
  videos: number
  reviews: number
}

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/admin/login')
      return
    }
    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      router.push('/admin')
      return
    }
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
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

  const cards: { label: string; value: number; accent?: boolean; warn?: boolean }[] = [
    { label: 'Diamantes registradas', value: stats?.total ?? 0, accent: true },
    { label: 'Aprobadas', value: stats?.approved ?? 0 },
    { label: 'En revisión', value: stats?.pending ?? 0, warn: true },
    { label: 'Rechazadas', value: stats?.rejected ?? 0 },
    { label: 'Activas', value: stats?.active ?? 0 },
    { label: 'Verificadas', value: stats?.verified ?? 0 },
    { label: 'Destacadas (VIP)', value: stats?.featured ?? 0 },
    { label: 'Fotos subidas', value: stats?.photos ?? 0 },
    { label: 'Videos / historias', value: stats?.videos ?? 0 },
    { label: 'Reseñas', value: stats?.reviews ?? 0 },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-accent hover:text-accent-hover mb-6 inline-block text-sm transition-colors">
        ← Volver al panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand font-serif italic mb-1">Estadísticas</h1>
        <p className="text-muted-light text-sm uppercase tracking-[0.06em]">Resumen general del sitio</p>
      </div>

      {(stats?.pending ?? 0) > 0 && (
        <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">
            Hay <strong>{stats?.pending}</strong> perfil(es) esperando aprobación.
          </p>
          <Link
            href="/admin/escorts"
            className="text-xs font-semibold uppercase tracking-[0.08em] bg-amber-500 text-white px-4 py-2 rounded-sm hover:bg-amber-600 transition-all whitespace-nowrap"
          >
            Revisar ahora
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`glass-float rounded-sm p-5 ${c.warn && c.value > 0 ? 'border border-amber-300/60' : ''}`}
          >
            <div
              className={`text-3xl font-bold font-serif mb-1 ${
                c.accent ? 'text-accent' : c.warn && c.value > 0 ? 'text-amber-600' : 'text-brand'
              }`}
            >
              {new Intl.NumberFormat('es-CL').format(c.value)}
            </div>
            <div className="text-[11px] text-muted-light uppercase tracking-[0.08em] leading-tight">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
