import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWTPayload, jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Exclure les routes publiques
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/signin') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/auth-options') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/multidevice')
  ) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get('authToken')?.value

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
    // Appliquer le middleware à toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
