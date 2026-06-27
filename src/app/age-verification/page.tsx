'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AgeVerificationPage() {
  const handleVerify = async () => {
    await fetch('/api/age-verify', { method: 'POST' })
    window.location.href = '/home'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm px-6">
      <div className="flex flex-col items-center w-full max-w-xs bg-[#f9f9f9] rounded-[48px] shadow-xl p-8 space-y-6">
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
        <p className="text-center text-base font-medium" style={{ color: '#727272' }}>
          Este sitio es solo para adultos
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
