import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  const isAuth = !!token;
  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith('/auth/login') || path.startsWith('/auth/registro');

  // Si llega a "/" redirigir a "/dashboard" si está autenticado
  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si no está autenticado y no es público, redirige a login
  if (!isAuth && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Si ya está autenticado y está en una página pública, redirige al dashboard
  if (isAuth && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/registro', '/'],
};
