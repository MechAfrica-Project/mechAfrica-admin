import { NextResponse } from 'next/dist/server/web/spec-extension/response'
import type { NextRequest } from 'next/dist/server/web/spec-extension/request'

// Define auth routes (login page)
const authRoutes = ['/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from cookies
  const authCookie = request.cookies.get('mechafrica-auth')

  let isAuthenticated = false

  // Parse the auth cookie to check authentication status
  if (authCookie?.value) {
    try {
      const authData = JSON.parse(authCookie.value)
      isAuthenticated = authData.state?.isAuthenticated && authData.state?.token
    } catch (error) {
      console.error('Error parsing auth cookie:', error)
      isAuthenticated = false
    }
  }

  // Check if the current path is a dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard')

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname)

  // If user is not authenticated and trying to access dashboard
  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth routes (login)
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard/dashboard/maps-page', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
