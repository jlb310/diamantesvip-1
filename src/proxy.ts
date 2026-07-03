import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'node:crypto'
import { timingSafeEqual } from 'node:crypto'

const SECRET = process.env.AUTH_SECRET || 'dev-only-not-for-production'

function verifyAgeCookie(value: string | undefined): boolean {
  if (!value) return false
  const parts = value.split('|')
  if (parts.length !== 3) return false
  const [verified, expiresStr, sig] = parts
  if (verified !== 'true') return false
  const expires = parseInt(expiresStr, 10)
  if (isNaN(expires) || Date.now() / 1000 > expires) return false

  const expectedSig = createHmac('sha256', SECRET).update(`${verified}|${expiresStr}`).digest('hex')
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expectedSig, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/home', '/age-verification', '/presentacion', '/api/auth', '/api/webp', '/api/age-verify', '/admin/login', '/admin/register', '/anunciate', '/contacto']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

  if (isPublicPath) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/register')) {
    const ageVerified = request.cookies.get('age-verified')?.value
    if (!verifyAgeCookie(ageVerified)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Redirige a /home (no a "/") para que se muestre el AgeGate y el usuario
  // pueda verificar edad. La raiz "/" es el splash "Pronto" sin gate ni nav,
  // lo que deja al usuario atrapado sin poder verificar.
  if (!verifyAgeCookie(request.cookies.get('age-verified')?.value)) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.jpeg|favicono.png|logo-extendido.jpeg|logo-cuadrado.jpeg|.*\\.(?:mp4|jpe?g|png|svg|webp|webmanifest|woff2?|css|js)).*)',
  ],
}