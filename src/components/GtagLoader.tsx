'use client'

import { useEffect } from 'react'

const GA_ID = 'G-KQ1GY490ND'

declare global {
  interface Window {
    dataLayer?: unknown[]
    __gtagLoaded?: boolean
  }
}

/**
 * Carga gtag.js recién en la PRIMERA interacción del usuario (tap, scroll,
 * tecla o mouse). El page_view se envía igual al cargar el script; solo se
 * pierden visitas que rebotan sin tocar nada. Motivo: gtag mete ~900ms de
 * tareas largas en el hilo principal en móvil y castigaba el TBT/PageSpeed.
 */
export function GtagLoader() {
  useEffect(() => {
    const load = () => {
      if (window.__gtagLoaded) return
      window.__gtagLoaded = true
      events.forEach(([target, ev]) => target.removeEventListener(ev, load))

      window.dataLayer = window.dataLayer || []
      function gtag(...args: unknown[]) {
        window.dataLayer!.push(args)
      }
      gtag('js', new Date())
      gtag('config', GA_ID)

      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(s)
    }

    const events: Array<[EventTarget, string]> = [
      [window, 'scroll'],
      [window, 'pointerdown'],
      [window, 'touchstart'],
      [window, 'keydown'],
      [window, 'mousemove'],
    ]
    events.forEach(([target, ev]) => target.addEventListener(ev, load, { once: true, passive: true }))
    return () => events.forEach(([target, ev]) => target.removeEventListener(ev, load))
  }, [])

  return null
}
