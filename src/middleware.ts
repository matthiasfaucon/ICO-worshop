import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWTPayload, jwtVerify } from 'jose'
import { validateToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Exclure les routes publiques
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '' ||
    request.nextUrl.pathname.startsWith('/multidevice') ||
    request.nextUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get('authToken')?.value
  
  if ( request.nextUrl.pathname === '/signin'
    || request.nextUrl.pathname === '/signup'
    || request.nextUrl.pathname === '/auth-options'
  ) {
    if (authToken) {
      const validToken = validateToken(authToken)
      if (validToken) {
        return NextResponse.redirect(new URL('/profil', request.url))
      }
      return NextResponse.next()
    } else {
      return NextResponse.next()
    }
  }

  if (!authToken) {
    return NextResponse.redirect(new URL('/auth-options', request.url))
  }

  // Vérification supplémentaire pour les routes admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(authToken, secret) as { payload: JWTPayload }

      if (payload?.role?.toLowerCase() !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth-options', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Appliquer le middleware à toutes les routes sauf les fichiers statiques et certains types de fichiers
    '/((?!_next/static|_next/image|favicon.ico|.*\\.json|.*\\.png|.*\\.jpeg|.*\\.svg|.*\\.woff|.*\\.woff2|.*\\.jpg|.*\\.webp).*)',
  ],
}
