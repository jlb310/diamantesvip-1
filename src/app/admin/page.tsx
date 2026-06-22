'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [escortId, setEscortId] = useState<string | null>(null)
  const [escortStatus, setEscortStatus] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/admin/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchEscortId(token)
  }, [router])

  const fetchEscortId = async (token: string) => {
    try {
      const res = await fetch('/api/admin/escort', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.escort?.id) setEscortId(data.escort.id)
      if (data.escort?.status) setEscortStatus(data.escort.status)
    } catch {}
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="animate-in mb-6">
        <h1 className="text-3xl font-bold text-brand font-serif italic mb-1">
          {isAdmin ? 'Panel de Administración' : 'Mi Panel'}
        </h1>
        <p className="text-muted-light text-sm uppercase tracking-[0.06em]">
          {isAdmin
            ? 'Gestiona perfiles y contenido del sitio'
            : `Bienvenida, ${user.name || user.email} — administra tu perfil`}
        </p>
      </div>

      {/* Aviso de estado de aprobación (solo diamantes) */}
      {!isAdmin && escortStatus === 'pending' && (
        <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <span className="text-xl leading-none">⏳</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Tu perfil está en revisión</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Nuestro equipo revisará tu perfil antes de publicarlo. Mientras tanto, completa tus datos y sube tus fotos para acelerar la aprobación.
            </p>
          </div>
        </div>
      )}
      {!isAdmin && escortStatus === 'rejected' && (
        <div className="mb-6 rounded-sm border border-red-300 bg-red-50 px-5 py-4 flex items-start gap-3">
          <span className="text-xl leading-none">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">Tu perfil no fue aprobado</p>
            <p className="text-xs text-red-600 mt-0.5">
              Revisa que tus datos y fotos cumplan con los requisitos. Si tienes dudas,{' '}
              <a href="https://wa.me/56932508878" target="_blank" className="underline font-medium">escríbenos por WhatsApp</a>.
            </p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-muted-light uppercase tracking-[0.12em] mb-3">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          {!isAdmin && (
            <>
              <Link href="/admin/profile" className="bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:shadow-lg hover:shadow-accent/20">
                Editar perfil
              </Link>
              <Link href="/admin/photos" className="glass text-brand font-semibold px-5 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:border-accent/40">
                Subir fotos
              </Link>
              <Link href="/admin/historias" className="bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:shadow-lg hover:shadow-accent/20 glow-pulse">
                Subir historias
              </Link>
              <Link href="/admin/tutorial" className="glass text-brand font-semibold px-5 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:border-accent/40">
                📖 Ver tutorial
              </Link>
            </>
          )}
          <Link href="/home" className="glass text-muted hover:text-brand font-medium px-5 py-2.5 rounded-sm text-xs transition-all">
            ← Volver al sitio
          </Link>
        </div>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
          <Link href="/admin/escorts" className="glass-float rounded-sm p-7 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Diamantes</h2>
            <p className="text-muted-light text-sm">Gestiona perfiles, verificaciones y destacados.</p>
          </Link>
          <Link href="/admin/stats" className="glass-float rounded-sm p-7 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Estadísticas</h2>
            <p className="text-muted-light text-sm">Resumen de perfiles, fotos, videos y aprobaciones.</p>
          </Link>
          <Link href="/admin/config" className="glass-float rounded-sm p-7 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Configuración</h2>
            <p className="text-muted-light text-sm">Datos de contacto del sitio (WhatsApp y correo).</p>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
          <Link href="/admin/profile" className="glass-float rounded-sm p-5 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Editar Perfil</h2>
            <p className="text-muted-light text-sm">Nombre, alias, descripción, servicios, medidas, horarios.</p>
          </Link>

          <Link href="/admin/photos" className="glass-float rounded-sm p-5 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Fotos y Videos</h2>
            <p className="text-muted-light text-sm">Sube hasta 8 fotos. Selecciona tu foto principal.</p>
          </Link>

          <Link href="/admin/tutorial" className="glass-float rounded-sm p-5 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Tutorial</h2>
            <p className="text-muted-light text-sm">Guía paso a paso para completar tu perfil y subir tu material.</p>
          </Link>

          <Link href="/admin/membresia" className="glass-float rounded-sm p-5 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
            <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Membresía</h2>
            <p className="text-muted-light text-sm">Administra tu suscripción y pagos mensuales.</p>
          </Link>

          <Link href="/admin/historias" className="glass-luxe rounded-sm p-5 group hover:border-accent/40 transition-all duration-400 hover:-translate-y-1 glow-pulse">
            <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Historias</h2>
            <p className="text-muted-light text-sm">Sube fotos y videos que desaparecen en 24h. Lo más visto del sitio.</p>
          </Link>

          {escortId ? (
            <Link href={`/escort/${escortId}`} target="_blank" className="glass-float rounded-sm p-5 group hover:border-accent/30 transition-all duration-400 hover:-translate-y-1">
              <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-brand font-serif mb-1.5 group-hover:text-accent transition-colors">Vista Previa</h2>
              <p className="text-muted-light text-sm">Así ven tu perfil los clientes. Revisa que todo esté correcto.</p>
            </Link>
          ) : (
            <div className="glass-float rounded-sm p-5">
              <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center text-accent mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-brand font-serif mb-1.5">Vista Previa</h2>
              <p className="text-muted-light text-sm">Guarda tu perfil primero para ver la vista previa.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
