import { prisma } from '@/lib/prisma'
import { EscortCard } from '@/components/EscortCard'
import { StoriesRow } from '@/components/StoriesRow'
import { ShortsRow } from '@/components/ShortsRow'
import { HeroVideo } from '@/components/HeroVideo'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Diamante y acompanantes en Chile',
  description:
    'Explora perfiles de Diamante y acompanantes en Chile por ciudad, precio y disponibilidad en Diamantes VIP.',
  alternates: { canonical: '/home' },
  openGraph: {
    title: 'Diamante y acompanantes en Chile',
    description:
      'Explora perfiles de Diamante y acompanantes en Chile por ciudad, precio y disponibilidad en Diamantes VIP.',
    url: '/home',
    type: 'website',
  },
}

interface HomeProps {
  searchParams: Promise<{
    q?: string
    toggles?: string
    tier?: string
  }>
}

const TIER_TITLES: Record<string, { label: string; color: string }> = {
  VIP: { label: 'Diamantes VIP', color: '#db7581' },
  Gold: { label: 'Diamantes Gold', color: '#c5a059' },
  Silver: { label: 'Diamantes Silver', color: '#8c8484' },
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const toggleKeys = params.toggles ? params.toggles.split(',') : []

  const where: Record<string, unknown> = { active: true, status: 'approved' }
  const conditions: Record<string, unknown>[] = []

  if (params.q) {
    conditions.push({
      OR: [
        { name: { contains: params.q } },
        { alias: { contains: params.q } },
        { city: { contains: params.q } },
        { description: { contains: params.q } },
        { nationality: { contains: params.q } },
        { services: { contains: params.q } },
        { bodyType: { contains: params.q } },
        { hairColor: { contains: params.q } },
        { eyeColor: { contains: params.q } },
        { bustSize: { contains: params.q } },
        { buttSize: { contains: params.q } },
        { waxing: { contains: params.q } },
        { languages: { contains: params.q } },
      ],
    })
  }

  if (toggleKeys.includes('verificada')) {
    conditions.push({ verified: true })
  }
  if (toggleKeys.includes('vip')) {
    conditions.push({ tier: 'VIP' })
  }
  if (toggleKeys.includes('domicilio')) {
    conditions.push({ homeService: true })
  }
  if (toggleKeys.includes('tatuajes')) {
    conditions.push({ tattoos: true })
  }
  if (toggleKeys.includes('piercings')) {
    conditions.push({ piercings: true })
  }
  if (toggleKeys.includes('depto')) {
    conditions.push({ atHome: true })
  }

  if (params.tier && ['VIP', 'Gold', 'Silver'].includes(params.tier)) {
    conditions.push({ tier: params.tier })
  }

  if (conditions.length > 0) {
    where.AND = conditions
  }

  const escorts = await prisma.escort.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      alias: true,
      age: true,
      city: true,
      mainPhoto: true,
      featured: true,
      price: true,
      nationality: true,
      verified: true,
      tier: true,
      _count: { select: { videos: true } },
    },
  })

  const shorts = await prisma.video.findMany({
    where: { escort: { active: true, status: 'approved' } },
    orderBy: { createdAt: 'desc' },
    include: {
      escort: {
        select: { name: true, alias: true, city: true, mainPhoto: true },
      },
    },
    take: 16,
  })

  const storyEscorts = await prisma.escort.findMany({
    where: { active: true, status: 'approved', videos: { some: {} } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      alias: true,
      city: true,
      mainPhoto: true,
      videos: { select: { url: true, thumbnail: true }, orderBy: { order: 'asc' } },
    },
  })

  const hasSearch = !!params.q || toggleKeys.length > 0 || !!params.tier
  const activeTier = params.tier && ['VIP', 'Gold', 'Silver'].includes(params.tier) ? params.tier : null
  const vipEscorts = escorts.filter((e) => e.tier === 'VIP')
  const goldEscorts = escorts.filter((e) => e.tier === 'Gold')
  const silverEscorts = escorts.filter((e) => e.tier === 'Silver')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Diamantes VIP',
    url: 'https://diamantesvip.cl',
    description:
      'Directorio de Diamante y acompanantes en Chile con perfiles verificados y busqueda por ciudad.',
    inLanguage: 'es-CL',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://diamantesvip.cl/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{ backgroundColor: '#F8E4E8' }} />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent-light/4 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative">
        <HeroVideo />
        <StoriesRow escorts={storyEscorts} />

        <div className="max-w-7xl mx-auto px-4 py-12">
          {escorts.length === 0 ? (
            <div className="text-center py-20">
              <div className="glass-card inline-block rounded-sm p-10">
                <p className="text-2xl text-muted-light font-serif italic mb-2">Sin resultados</p>
                <p className="text-muted-light text-sm">Intenta con otros filtros</p>
              </div>
            </div>
          ) : activeTier ? (
            <Section tier={activeTier} escorts={escorts} />
          ) : hasSearch ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 stagger">
              {escorts.map((escort) => (
                <EscortCard key={escort.id} escort={escort} />
              ))}
            </div>
          ) : (
            <div className="space-y-14">
              {/* VIP section */}
              {vipEscorts.length > 0 && (
                <Section
                  tier="VIP"
                  escorts={vipEscorts}
                />
              )}

              {/* Gold section */}
              {goldEscorts.length > 0 && (
                <Section
                  tier="Gold"
                  escorts={goldEscorts}
                />
              )}

              {/* Silver section */}
              {silverEscorts.length > 0 && (
                <Section
                  tier="Silver"
                  escorts={silverEscorts}
                />
              )}
            </div>
          )}

          <ShortsRow
            shorts={shorts.map((v) => ({
              id: v.id,
              url: v.url,
              thumbnail: v.thumbnail,
              escortName: v.escort.alias || v.escort.name,
              escortCity: v.escort.city,
              escortPhoto: v.escort.mainPhoto,
            }))}
          />
        </div>
      </div>
    </div>
  )
}

function Section({
  tier,
  escorts,
}: {
  tier: string
  escorts: {
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
  }[]
}) {
  const { label, color } = TIER_TITLES[tier] || { label: tier, color: '#8c8484' }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-xl md:text-2xl font-bold font-serif italic" style={{ color }}>
          {label}
        </h2>
        <span className="text-xs text-muted-light">({escorts.length})</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 stagger">
        {escorts.map((escort) => (
          <EscortCard key={escort.id} escort={escort} />
        ))}
      </div>
    </div>
  )
}
