import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="glass-strong border-t border-border/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Image
              src="/logo-cuadrado.jpeg"
              alt="Diamantes VIP"
              width={96}
              height={96}
              className="h-24 w-auto mb-4 rounded-xl"
            />
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Directorio de Diamante y acompanantes en Chile. Conectamos personas exigentes con perfiles verificados y experiencias unicas.
            </p>
          </div>

          {/* Explora */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-brand font-semibold mb-3 uppercase tracking-wider text-sm">Explora</h4>
            <nav className="flex flex-col items-center md:items-start gap-2">
              <Link href="/home" className="text-muted hover:text-accent text-sm transition-colors">
                Inicio
              </Link>
              <Link href="/anunciate" className="text-muted hover:text-accent text-sm transition-colors">
                Anúnciate
              </Link>
              <Link href="/admin" className="text-muted hover:text-accent text-sm transition-colors">
                Panel
              </Link>
              <Link href="/contacto" className="text-muted hover:text-accent text-sm transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-brand font-semibold mb-3 uppercase tracking-wider text-sm">Legal</h4>
            <nav className="flex flex-col items-center md:items-start gap-2">
              <span className="text-muted-light text-sm">Solo para mayores de 18 años</span>
              <span className="text-muted-light text-sm">Todas las modelos son verificadas</span>
              <span className="text-muted text-sm">&copy; {new Date().getFullYear()} Diamantes VIP</span>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-muted-light text-xs max-w-md mx-auto">
            Diamantes VIP no interfiere en los acuerdos entre las partes. Todo servicio es entre adultos consintientes.
          </p>
        </div>
      </div>
    </footer>
  )
}
