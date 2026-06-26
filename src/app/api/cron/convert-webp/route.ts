import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { runWebpConversion } from '@/lib/webp-convert'

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Requiere rol admin' }, { status: 403 })
  }

  try {
    await runWebpConversion()
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error running webp conversion:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
