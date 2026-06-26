'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { webpUrl } from '@/lib/webp'

interface EscortItem {
  id: string
  name: string
  alias: string | null
  age: number
  city: string
  featured: boolean
  verified: boolean
  active: boolean
  status: string
  mainPhoto: string | null
  price: number | null
  createdAt: string
  user: { email: string }
  _count: { photos: number; videos: number; reviews: number }
}

type StatusValue = 'approved' | 'pending' | 'rejected'

export default function EscortsManager() {
  const router = useRouter()
  const [escorts, setEscorts] = useState<EscortItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchEscorts(token)
  }, [router])

  const fetchEscorts = async (token: string) => {
    try {
      const res = await fetch('/api/admin/escorts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.escorts) setEscorts(data.escorts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const patchEscort = async (
    escortId: string,
    patch: Partial<Pick<EscortItem, 'featured' | 'verified' | 'active' | 'status'>>
  ) => {
    setUpdating(escortId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/escorts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ escortId, ...patch }),
      })
      if (res.ok) {
        setEscorts((prev) =>
          prev.map((e) => (e.id === escortId ? { ...e, ...patch } : e))
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const pending = escorts.filter((e) => e.status === 'pending')
  const reviewed = escorts.filter((e) => e.status !== 'pending')

  const statusBadge = (status: string) => {
    if (status === 'pending')
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">En revisión</span>
    if (status === 'rejected')
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600">Rechazada</span>
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Aprobada</span>
  }

  const Avatar = ({ escort }: { escort: EscortItem }) => (
    <div className="w-14 h-14 rounded-sm bg-surface-container overflow-hidden flex-shrink-0 relative">
      {escort.mainPhoto && escort.mainPhoto.startsWith('http') ? (
        <Image src={webpUrl(escort.mainPhoto)} alt={escort.name} fill sizes="56px" className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl">💎</div>
      )}
    </div>
  )

  const InfoLine = ({ escort }: { escort: EscortItem }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
        <h3 className="text-base font-semibold text-brand font-display">{escort.alias || escort.name}</h3>
        <span className="text-xs text-muted-light">({escort.age} años)</span>
        {statusBadge(escort.status)}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-light flex-wrap">
        <span>{escort.city}</span>
        <span>·</span>
        <span>{escort.user.email}</span>
        <span>·</span>
        <span>{escort._count.photos} fotos</span>
        <span>·</span>
        <span>{escort._count.videos} videos</span>
        <span>·</span>
        <span>{escort._count.reviews} reseñas</span>
        {escort.price && (
          <>
            <span>·</span>
            <span className="text-accent">${new Intl.NumberFormat('es-CL').format(escort.price)}</span>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-accent hover:text-accent-hover mb-6 inline-block text-sm transition-colors">
        ← Volver al panel
      </Link>

      <div className="animate-in mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-brand mb-1">Gestión de Diamantes</h1>
            <p className="text-muted-light text-sm uppercase tracking-[0.06em]">
              {escorts.length} perfiles registrados
            </p>
          </div>
          <div className="glass rounded-sm px-4 py-2 text-xs text-muted-light">
            VIP · Verificadas · Activas
          </div>
        </div>
      </div>

      {/* PENDIENTES DE APROBACIÓN */}
      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-amber-700 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pendientes de aprobación ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((escort) => (
              <div
                key={escort.id}
                className="rounded-sm p-5 flex items-center gap-5 border border-amber-300/60 bg-amber-50/40"
              >
                <Avatar escort={escort} />
                <InfoLine escort={escort} />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/diamante/${escort.id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-surface-container text-muted hover:bg-surface-dim transition-all"
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={() => patchEscort(escort.id, { status: 'rejected' })}
                    disabled={updating === escort.id}
                    className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => patchEscort(escort.id, { status: 'approved' })}
                    disabled={updating === escort.id}
                    className="px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                  >
                    ✓ Aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TODOS LOS PERFILES */}
      <div className="space-y-3">
        {reviewed.map((escort) => (
          <div
            key={escort.id}
            className={`glass-float rounded-sm p-5 flex items-center gap-5 transition-all duration-300 ${
              !escort.active || escort.status === 'rejected' ? 'opacity-50' : ''
            }`}
          >
            <Avatar escort={escort} />
            <InfoLine escort={escort} />

            {/* Toggles */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {escort.status === 'rejected' && (
                <button
                  onClick={() => patchEscort(escort.id, { status: 'approved' })}
                  disabled={updating === escort.id}
                  className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                >
                  Reactivar
                </button>
              )}

              <button
                onClick={() => patchEscort(escort.id, { featured: !escort.featured })}
                disabled={updating === escort.id}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] transition-all ${
                  escort.featured
                    ? 'bg-brand text-white hover:bg-brand-hover'
                    : 'bg-surface-container text-muted-light hover:bg-surface-dim'
                }`}
              >
                {escort.featured ? '★ VIP' : 'VIP'}
              </button>

              <button
                onClick={() => patchEscort(escort.id, { verified: !escort.verified })}
                disabled={updating === escort.id}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] transition-all ${
                  escort.verified
                    ? 'bg-accent text-white hover:bg-accent-hover'
                    : 'bg-surface-container text-muted-light hover:bg-surface-dim'
                }`}
              >
                {escort.verified ? '✓ Verificada' : 'Verificar'}
              </button>

              <button
                onClick={() => patchEscort(escort.id, { active: !escort.active })}
                disabled={updating === escort.id}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] transition-all ${
                  escort.active
                    ? 'bg-surface-container text-muted hover:bg-surface-dim'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
              >
                {escort.active ? 'Activa' : 'Inactiva'}
              </button>

              <Link
                href={`/diamante/${escort.id}`}
                target="_blank"
                className="text-muted-light hover:text-accent transition-colors text-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
