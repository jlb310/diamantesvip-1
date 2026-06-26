'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { SearchBar } from '@/components/SearchBar'

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  // Close overlays on route change
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Hide on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    if (currentY < 80) {
      setHidden(false)
    } else if (currentY > lastScrollY.current + 4) {
      setHidden(true)
    } else if (currentY < lastScrollY.current - 4) {
      setHidden(false)
    }
    lastScrollY.current = currentY
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (pathname === '/') {
    return null
  }

  const navLinks = [
    { key: 'inicio', href: '/home', label: 'Inicio' },
    { key: 'vip', href: '/home?tier=VIP', label: 'Diamantes Vip' },
    { key: 'gold', href: '/home?tier=Gold', label: 'Diamantes Gold' },
    { key: 'silver', href: '/home?tier=Silver', label: 'Diamantes Silver' },
    { key: 'anunciate', href: '/anunciate', label: 'Anúnciate' },
    { key: 'contacto', href: '/contacto', label: 'Contáctanos' },
  ]

  return (
    <>
      <header
        className={`bg-white sticky top-0 z-[70] border-b border-border/10 transition-transform duration-400 ease-out ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Top edge gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
          <Link href="/home" className="flex items-center flex-shrink-0">
            <Image
              src="/logo-extendido.jpeg"
              alt="Diamantes VIP"
              width={160}
              height={64}
              className="h-10 md:h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-xs tracking-[0.1em] uppercase">
            {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-muted-light hover:text-brand transition-colors duration-300"
                >
                  {link.label}
                </Link>
              )
            )}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-muted-light hover:text-[#db7581] transition-colors duration-300"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link
              href="/dev-login?role=admin"
              className="text-[#db7581] hover:text-accent transition-colors duration-300"
            >
              Admin
            </Link>
            <Link
              href="/dev-login?role=escort"
              className="text-[#db7581] hover:text-accent transition-colors duration-300"
            >
              Diamante
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-muted-light hover:text-[#db7581] transition-colors duration-300"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`relative flex flex-col justify-center items-center w-11 h-11 gap-1.5 transition-opacity duration-300 ${
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
          className={`absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-[#f9f9f9] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Decorative top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#f9dade] via-[#db7581] to-accent" />

          <div className="flex flex-col h-full p-8 pt-16">
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

            {/* Logo */}
            <div className="mb-10">
              <Image
                src="/logo-cuadrado.jpeg"
                alt="Diamantes VIP"
                width={64}
                height={64}
                className="h-16 w-auto rounded-xl"
              />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center py-3.5 px-4 rounded-xl text-[#727272] hover:text-brand hover:bg-[#f9dade]/60 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-base font-medium tracking-wide">{link.label}</span>
                    <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#db7581]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
              ))}
              <div className="my-2 border-t border-[#f9dade]" />
              <Link
                href="/dev-login?role=admin"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center py-3.5 px-4 rounded-xl text-[#db7581] hover:text-brand hover:bg-[#f9dade]/60 transition-all duration-300"
              >
                <span className="text-base font-medium tracking-wide">Admin</span>
                <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#db7581]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/dev-login?role=escort"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center py-3.5 px-4 rounded-xl text-[#db7581] hover:text-brand hover:bg-[#f9dade]/60 transition-all duration-300"
              >
                <span className="text-base font-medium tracking-wide">Diamante</span>
                <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#db7581]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </nav>

            {/* Bottom accent */}
            <div className="mt-auto pt-8">
              <div className="w-12 h-1 rounded-full bg-[#f9dade] mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
