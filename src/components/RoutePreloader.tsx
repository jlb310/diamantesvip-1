'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

// Tiempo mínimo que el preloader permanece visible para que la animación se lea.
const MIN_DISPLAY_MS = 600
// Tiempo máximo de seguridad: si la navegación no completa, oculta igual.
const MAX_DISPLAY_MS = 4000

/**
 * Preloader de transición entre páginas.
 * Reutiliza el diamante animado (preloader.png + anillos radar) de la sección
 * Contacto del perfil. Detecta el inicio de navegación vía clic en links
 * internos y oculta el overlay cuando la nueva ruta monta (cambio de pathname),
 * respetando un mínimo de visibilidad.
 */
export function RoutePreloader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const startRef = useRef(0)
  const prevPathRef = useRef(pathname)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Intercepta clics en anchors internos para mostrar el preloader al iniciar la navegación.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (anchor.target === '_blank') return
      const href = anchor.getAttribute('href')
      if (!href) return
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (/^(https?:)?\/\//i.test(href)) return
      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      ) {
        return
      }

      startRef.current = Date.now()
      setVisible(true)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = setTimeout(() => setVisible(false), MAX_DISPLAY_MS)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  // Oculta el preloader cuando la nueva ruta monta (pathname cambió),
  // respetando el mínimo de visibilidad.
  useEffect(() => {
    const pathChanged = prevPathRef.current !== pathname
    prevPathRef.current = pathname
    if (!visible) return
    if (pathChanged) {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setVisible(false), remaining)
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [pathname, visible])

  if (!visible) return null

  return (
    <div className="route-preloader-overlay" aria-hidden="true">
      <div className="preloader-contact">
        <span className="preloader-ring" />
        <span className="preloader-ring" />
        <span className="preloader-ring" />
        <Image
          src="/preloader.png"
          alt=""
          width={72}
          height={72}
          className="preloader-core"
          unoptimized
          priority
        />
      </div>
    </div>
  )
}
