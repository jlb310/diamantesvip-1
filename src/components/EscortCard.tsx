import Link from 'next/link'
import Image from 'next/image'
import { webpUrl } from '@/lib/webp'

interface EscortCardProps {
  escort: {
    id: string
    name: string
    alias: string | null
    age: number
    city: string
    mainPhoto: string | null
    featured: boolean
    price: number | null
    nationality: string | null
    verified: boolean
    tier: string
    _count: { videos: number }
  }
}

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  VIP: { bg: '#db7581', text: '#ffffff', label: 'VIP' },
  Gold: { bg: '#c5a059', text: '#ffffff', label: 'Gold' },
  Silver: { bg: '#8c8484', text: '#ffffff', label: 'Silver' },
}

export function EscortCard({ escort }: EscortCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const tierStyle = TIER_STYLES[escort.tier] || TIER_STYLES.Silver
  const hasVideos = escort._count.videos > 0

  return (
    <Link
      href={`/diamante/${escort.id}`}
      className="group block glass-float rounded-sm overflow-hidden"
    >
      <div className="aspect-[2/3] relative bg-surface-container overflow-hidden">
        {escort.mainPhoto && escort.mainPhoto.startsWith('http') ? (
          <Image
            src={webpUrl(escort.mainPhoto)}
            alt={escort.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl text-surface-dim">💎</span>
          </div>
        )}

        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

        {/* Tier badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.12em]"
            style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
          >
            {tierStyle.label}
          </span>
        </div>

        {/* Price label — top right */}
        {escort.price && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black/45 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg group-hover:scale-105 transition-transform duration-400">
              {formatPrice(escort.price)}
            </div>
          </div>
        )}

        {/* Bottom overlay: name + age + media indicator */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white text-sm md:text-lg font-bold font-serif capitalize drop-shadow-lg leading-tight line-clamp-1">
                {escort.alias || escort.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-white/80 text-xs font-medium">{escort.age}</span>
                {escort.nationality && (
                  <>
                    <span className="w-1 h-1 bg-white/40 rounded-full flex-shrink-0" />
                    <span className="text-white/80 text-xs font-medium truncate">{escort.nationality}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-black/35 backdrop-blur-sm">
              {hasVideos ? (
                <svg className="w-4 h-4 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 4h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v6h2V6H5zm10 .75l4.72-2.36a1 1 0 011.28 1.28L18.64 10.3a1 1 0 010 .72l2.36 4.72a1 1 0 01-1.28 1.28L15 14.66V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6a1 1 0 011-1h2a1 1 0 011 1v.75z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 5h13v7H4V5zm1 1v5h11V6H5zm4 7l3 3h7v-7h-4v4H9zm-5 4h16v2H4v-2z" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
