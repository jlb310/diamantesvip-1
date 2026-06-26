import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/home', '/age-verification', '/presentacion', '/api/auth', '/api/webp', '/admin/login', '/admin/register', '/anunciate', '/contacto']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

  if (isPublicPath) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const ageVerified = request.cookies.get('age-verified')?.value

  if (ageVerified !== 'true') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.jpeg|.*\\.(?:mp4|jpe?g|png|svg|webp|webmanifest|woff2?|css|js)).*)',
  ],
}
