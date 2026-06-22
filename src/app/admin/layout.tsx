'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface MenuItem {
  key: string
  href: string
  label: string
  icon: React.ReactNode
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [escortId, setEscortId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/admin/login')
      return
    }
    const parsed = JSON.parse(userData)
    setUser(parsed)
    fetchEscortId(token)
  }, [router])

  const fetchEscortId = async (token: string) => {
    try {
      const res = await fetch('/api/admin/escort', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.escort?.id) setEscortId(data.escort.id)
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin/login')
  }

  if (pathname === '/admin/login' || pathname === '/admin/register') {
    return <>{children}</>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const isAdmin = user.role === 'admin'

  const adminMenuItems: MenuItem[] = [
    { key: 'panel', href: '/admin', label: 'Panel', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { key: 'escorts', href: '/admin/escorts', label: 'Diamantes', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { key: 'stats', href: '/admin/stats', label: 'Estadísticas', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { key: 'config', href: '/admin/config', label: 'Configuración', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ]

  const escortMenuItems: MenuItem[] = [
    { key: 'panel', href: '/admin', label: 'Panel', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { key: 'perfil', href: '/admin/profile', label: 'Editar Perfil', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { key: 'fotos', href: '/admin/photos', label: 'Fotos y Videos', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { key: 'membresia', href: '/admin/membresia', label: 'Membresía', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { key: 'historias', href: '/admin/historias', label: 'Historias', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
    { key: 'tutorial', href: '/admin/tutorial', label: 'Tutorial', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  ]

  if (escortId) {
    escortMenuItems.push({
      key: 'publico',
      href: `/escort/${escortId}`,
      label: 'Perfil público',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
    })
  }

  const menuItems = isAdmin ? adminMenuItems : escortMenuItems

  return (
    <div className="min-h-screen relative">
      {/* Atmospheric bg */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[150px]" />
      </div>

      <header className="bg-surface sticky top-0 z-50 border-b border-border/10">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/admin" className="text-xl font-bold text-brand font-serif tracking-tight whitespace-nowrap">
              Panel<span className="text-accent font-light">VIP</span>
            </Link>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-[0.12em] flex-shrink-0 ${isAdmin ? 'bg-brand text-white' : 'bg-accent text-white'}`}>
              {isAdmin ? 'Admin' : 'Diamante'}
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 min-w-0">
            <nav className="flex items-center gap-5 text-xs font-medium tracking-[0.08em] uppercase">
              <Link href="/admin" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                Panel
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/escorts" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Diamantes
                  </Link>
                  <Link href="/admin/stats" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Estadísticas
                  </Link>
                  <Link href="/admin/config" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Configuración
                  </Link>
                </>
              )}
              {!isAdmin && (
                <>
                  <Link href="/admin/profile" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Perfil
                  </Link>
                  <Link href="/admin/photos" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Fotos
                  </Link>
                  <Link href="/admin/membresia" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Membresía
                  </Link>
                  <Link href="/admin/historias" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Historias
                  </Link>
                  <Link href="/admin/tutorial" className="text-muted-light hover:text-brand transition-colors duration-300 whitespace-nowrap">
                    Tutorial
                  </Link>
                </>
              )}
              {escortId && (
                <a href={`/escort/${escortId}`} target="_blank" className="text-accent/70 hover:text-accent transition-colors duration-300 whitespace-nowrap">
                  Perfil público ↗
                </a>
              )}
            </nav>
            <button onClick={handleLogout} className="text-muted-light hover:text-accent transition-colors duration-300 text-xs tracking-[0.08em] uppercase flex-shrink-0">
              Salir
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden relative flex flex-col justify-center items-center w-10 h-10 gap-1.5 transition-opacity duration-300 ${
              menuOpen ? 'z-[70]' : 'z-50'
            }`}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-2 bg-brand' : 'bg-[#db7581]'
              }`}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${
                menuOpen ? 'opacity-0 bg-brand' : 'bg-[#db7581]'
              }`}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-2 bg-brand' : 'bg-[#db7581]'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-brand/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[340px] bg-[#f9f9f9] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Decorative top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#f9dade] via-[#db7581] to-accent" />

          <div className="flex flex-col h-full p-6 pt-14">
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-[#727272] hover:text-brand transition-colors"
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header info */}
            <div className="mb-6">
              <p className="text-xs text-muted-light uppercase tracking-[0.12em] font-semibold mb-1">
                {isAdmin ? 'Administración' : 'Mi cuenta'}
              </p>
              <p className="text-brand font-serif italic text-lg">
                Panel<span className="text-accent font-light">VIP</span>
              </p>
            </div>

            {/* Grid menu */}
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  target={item.href.startsWith('/escort/') ? '_blank' : undefined}
                  className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl bg-white border border-[#f9dade] text-[#727272] hover:text-brand hover:bg-[#f9dade]/40 hover:border-[#db7581]/40 transition-all duration-300 p-3 text-center"
                >
                  <span className="text-[#db7581]">{item.icon}</span>
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </Link>
              ))}

              {/* Logout button */}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl bg-white border border-[#f9dade] text-[#727272] hover:text-accent hover:bg-red-50 hover:border-red-200 transition-all duration-300 p-3 text-center"
              >
                <span className="text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span className="text-xs font-medium leading-tight">Salir</span>
              </button>
            </div>

            {/* Bottom accent */}
            <div className="mt-auto pt-8">
              <div className="w-12 h-1 rounded-full bg-[#f9dade] mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
