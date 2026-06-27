import { verifyToken } from '@/lib/auth'

export function getAuthPayload(authHeader: string | null): any {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  return verifyToken(token)
}

export function requireAuth(authHeader: string | null): { payload: any } | { error: Response } {
  const payload = getAuthPayload(authHeader)
  if (!payload) {
    return { error: new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) }
  }
  return { payload }
}

export function requireAdmin(authHeader: string | null): { payload: any } | { error: Response } {
  const result = requireAuth(authHeader)
  if ('error' in result) return result
  if (result.payload.role !== 'admin') {
    return { error: new Response(JSON.stringify({ error: 'Se requieren permisos de administrador' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) }
  }
  return result
}