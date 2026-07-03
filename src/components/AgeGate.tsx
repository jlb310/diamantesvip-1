'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function AgeGate() {
  // null = aún sin determinar (evita parpadeo durante hidratación)
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const hasCookie = document.cookie
      .split('; ')
      .some((c) => c.startsWith('age-gate-dismissed=true'))
    setVerified(hasCookie)
  }, [])

  const handleVerify = async () => {
    // Solo cerrar el modal si la cookie firmada se seteo Really.
    // Si el POST falla, dejamos el modal abierto para reintentar; de lo
    // contrario el usuario queda bloqueado: sin cookie 'age-verified' el
    // proxy redirige los perfiles, y al estar 'age-gate-dismissed' el modal
    // no vuelve a mostrarse.
    try {
      const res = await fetch('/api/age-verify', { method: 'POST' })
      if (!res.ok) throw new Error('age-verify responded ' + res.status)
    } catch (e) {
      console.error('age-verify failed:', e)
      return
    }
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `age-gate-dismissed=true; path=/; expires=${expires}; SameSite=Lax`
    setVerified(true)
  }

  // Mientras se determina, o si ya está verificado, no mostramos nada.
  if (verified === null || verified) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md px-6"
    >
      <div className="flex flex-col items-center w-full max-w-xs bg-[#f9f9f9] rounded-[48px] shadow-2xl p-8 space-y-6">
        {/* Logo cuadrado */}
        <Image
          src="/logo-cuadrado.jpeg"
          alt="Diamantes VIP"
          width={200}
          height={200}
          className="rounded-2xl"
          priority
        />

        {/* Texto */}
        <p
          id="age-gate-title"
          className="text-center text-base font-medium"
          style={{ color: '#727272' }}
        >
          Este sitio es solo para mayores de 18 años
        </p>

        {/* Botón mayor de edad */}
        <button
          onClick={handleVerify}
          className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide uppercase transition-colors active:scale-[0.98]"
          style={{ backgroundColor: '#f9dade', color: '#727272' }}
        >
          Soy mayor de 18 años
        </button>

        {/* Enlace menor de edad */}
        <a
          href="https://www.google.com"
          className="text-sm underline underline-offset-4 transition-colors"
          style={{ color: '#727272' }}
        >
          Soy menor de 18 años
        </a>

        {/* Botones outline */}
        <div className="flex w-full gap-3 pt-2">
          <Link
            href="/anunciate"
            className="flex-1 py-3 px-4 rounded-md text-sm font-medium text-center border transition-colors active:scale-[0.98]"
            style={{ borderColor: '#727272', color: '#727272' }}
          >
            Anúnciate
          </Link>
          <a
            href="https://wa.me/56932508878"
            className="flex-1 py-3 px-4 rounded-md text-sm font-medium text-center border transition-colors active:scale-[0.98]"
            style={{ borderColor: '#727272', color: '#727272' }}
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  )
}
