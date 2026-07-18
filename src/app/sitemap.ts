import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// Dinámico: con Postgres la DB no está disponible durante `next build`
// (antes se creaba una SQLite vacía solo para prerenderar esto).
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://diamantesvip.cl'
  const escorts = await prisma.escort
    .findMany({
      where: { active: true, status: 'approved' },
      select: { id: true, updatedAt: true },
    })
    .catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/anunciate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const escortRoutes: MetadataRoute.Sitemap = escorts.map((escort) => ({
    url: `${baseUrl}/diamante/${escort.id}`,
    lastModified: escort.updatedAt,
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticRoutes, ...escortRoutes]
}
