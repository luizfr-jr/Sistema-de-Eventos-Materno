import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Rotas públicas
  const isPublicRoute = nextUrl.pathname === '/' ||
                       nextUrl.pathname.startsWith('/login') ||
                       nextUrl.pathname.startsWith('/register') ||
                       nextUrl.pathname.startsWith('/api/auth')

  // Rotas do dashboard (protegidas)
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')

  // Se está tentando acessar dashboard sem estar logado
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Se está logado e tentando acessar login/register
  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
