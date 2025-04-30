import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  const isAuth = !!token;
  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith('/auth/login') || path.startsWith('/auth/registro');

  if (!isAuth && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuth && isPublic) {
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/registro'],
};
