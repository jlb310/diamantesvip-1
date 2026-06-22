import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = auth.replace('Bearer ', '')
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Requiere rol admin' }, { status: 403 })
    }

    const [
      total,
      approved,
      pending,
      rejected,
      active,
      verified,
      featured,
      photos,
      videos,
      reviews,
    ] = await Promise.all([
      prisma.escort.count(),
      prisma.escort.count({ where: { status: 'approved' } }),
      prisma.escort.count({ where: { status: 'pending' } }),
      prisma.escort.count({ where: { status: 'rejected' } }),
      prisma.escort.count({ where: { active: true } }),
      prisma.escort.count({ where: { verified: true } }),
      prisma.escort.count({ where: { featured: true } }),
      prisma.photo.count(),
      prisma.video.count(),
      prisma.review.count(),
    ])

    return NextResponse.json({
      stats: { total, approved, pending, rejected, active, verified, featured, photos, videos, reviews },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
