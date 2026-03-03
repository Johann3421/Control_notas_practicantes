import { NextResponse } from "next/server"

export default function middleware(req: any) {
  const { nextUrl } = req
  const path = nextUrl.pathname

  // Public routes
  const isPublicRoute = path === "/login" || path.startsWith("/api/auth")
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for any known Auth.js / NextAuth session cookie.
  // In production (HTTPS) Auth.js v5 prefixes cookies with __Secure-
  // so we must match both forms.
  const cookieHeader = req.headers.get("cookie") || ""
  const hasSessionCookie =
    /(^|; )(__Secure-)?authjs\.session-token=/.test(cookieHeader) ||
    /(^|; )(__Secure-)?next-auth\.session-token=/.test(cookieHeader)

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
