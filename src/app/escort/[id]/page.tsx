import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EscortProfilePage from '@/components/EscortProfile'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

async function getEscort(id: string) {
  const escort = await prisma.escort.findUnique({
    where: { id, active: true, status: 'approved' },
    include: {
      photos: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  })
  return escort
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const escort = await prisma.escort.findUnique({
    where: { id, active: true, status: 'approved' },
    select: { name: true, alias: true, city: true, description: true },
  })

  if (!escort) {
    return {
      title: 'Perfil no encontrado',
      robots: { index: false, follow: false },
    }
  }

  const profileName = escort.alias || escort.name
  const title = `${profileName} - Diamante en ${escort.city}`
  const description =
    escort.description?.slice(0, 150) ||
    `Conoce a ${profileName}, Diamante en ${escort.city}. Perfil y disponibilidad en Diamantes VIP.`

  return {
    title,
    description,
    keywords: ['Diamante', 'Diamantes', escort.city, profileName],
    alternates: { canonical: `/escort/${id}` },
    openGraph: {
      title,
      description,
      url: `/escort/${id}`,
      type: 'profile',
    },
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const escort = await getEscort(id)

  if (!escort) {
    notFound()
  }

  return <EscortProfilePage escort={escort} />
}
