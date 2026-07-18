import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthPayload } from '@/lib/require-auth'

// Marca una foto (propia) como foto principal del perfil (escort.mainPhoto).
export async function POST(req: NextRequest) {
  try {
    const payload = getAuthPayload(req.headers.get('authorization'))
    if (!payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const escort = await prisma.escort.findFirst({
      where: { userId: payload.id },
      select: { id: true },
    })
    if (!escort) {
      return NextResponse.json({ error: 'Diamante no encontrada' }, { status: 404 })
    }

    const { photoId } = await req.json()
    if (!photoId) {
      return NextResponse.json({ error: 'Falta el id de la foto' }, { status: 400 })
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } })
    if (!photo || photo.escortId !== escort.id) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })
    }

    await prisma.escort.update({
      where: { id: escort.id },
      data: { mainPhoto: photo.url },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting main photo:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
