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

    const escorts = await prisma.escort.findMany({
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { email: true } },
        _count: { select: { photos: true, videos: true, reviews: true } },
      },
    })

    return NextResponse.json({ escorts })
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json()
    const { escortId, featured, verified, active, status } = body

    if (!escortId) {
      return NextResponse.json({ error: 'Falta escortId' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (typeof featured === 'boolean') updateData.featured = featured
    if (typeof verified === 'boolean') updateData.verified = verified
    if (typeof active === 'boolean') updateData.active = active
    if (status === 'approved' || status === 'pending' || status === 'rejected') {
      updateData.status = status
    }

    const escort = await prisma.escort.update({
      where: { id: escortId },
      data: updateData,
    })

    return NextResponse.json({ success: true, escort })
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
