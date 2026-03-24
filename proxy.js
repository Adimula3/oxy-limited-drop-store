import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // /admin — must be logged in AND have ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn || userRole !== 'ADMIN') {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
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
