import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from '@/lib/auth.config'

// Use the edge-safe config — no Prisma, no Node.js-only APIs
const { auth } = NextAuth(authConfig)

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // /admin — not logged in → /login with callbackUrl
  //          logged in but not ADMIN → /
  //          logged in AND ADMIN → let through
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // /account — must be logged in
  if (pathname.startsWith('/account')) {
    if (!isLoggedIn) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
