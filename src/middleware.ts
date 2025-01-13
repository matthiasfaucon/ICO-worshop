import { NextResponse } from 'next/server';

export function middleware(req: any) {
  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  // Si pas sur un appareil mobile, rediriger vers une page qui le dit clairement à l'utilisateur
  if (!isMobile) {
    return NextResponse.redirect(new URL('/not-mobile', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
