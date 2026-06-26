import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const escort = await prisma.escort.findUnique({
      where: { userId: decoded.id },
      select: { id: true },
    })

    if (!escort) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const start7 = new Date(startToday)
    start7.setDate(start7.getDate() - 6)
    const start30 = new Date(startToday)
    start30.setDate(start30.getDate() - 29)

    const [total, today, last7, last30, uniqueTotal] = await Promise.all([
      prisma.profileVisit.count({ where: { escortId: escort.id } }),
      prisma.profileVisit.count({
        where: { escortId: escort.id, createdAt: { gte: startToday } },
      }),
      prisma.profileVisit.count({
        where: { escortId: escort.id, createdAt: { gte: start7 } },
      }),
      prisma.profileVisit.count({
        where: { escortId: escort.id, createdAt: { gte: start30 } },
      }),
      prisma.profileVisit.groupBy({
        by: ['ipHash'],
        where: { escortId: escort.id, ipHash: { not: null } },
        _count: { _all: true },
      }),
    ])

    const last30Days: { date: string; count: number }[] = []
    const dayMap = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(start30)
      d.setDate(start30.getDate() + i)
      dayMap.set(d.toISOString().slice(0, 10), 0)
    }
    const dailyAgg = await prisma.profileVisit.findMany({
      where: { escortId: escort.id, createdAt: { gte: start30 } },
      select: { createdAt: true },
    })
    for (const v of dailyAgg) {
      const key = v.createdAt.toISOString().slice(0, 10)
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1)
    }
    for (const [date, count] of dayMap) {
      last30Days.push({ date, count })
    }

    return NextResponse.json({
      stats: {
        total,
        today,
        last7,
        last30,
        uniqueTotal: uniqueTotal.length,
        daily: last30Days,
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching escort visit stats:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
