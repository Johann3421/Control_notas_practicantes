import { NextResponse } from "next/server"

export default function middleware(req: any) {
  const { nextUrl } = req
  const path = nextUrl.pathname

  // Public routes
  const isPublicRoute = path === "/login" || path.startsWith("/api/auth")
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Simple session presence check (dev): next-auth stores a session cookie when using JWT strategy
  const cookieHeader = req.headers.get("cookie") || ""
  // Accept either NextAuth (legacy) or Auth.js cookie names used by the project
  const hasSessionCookie = /(^|; )(__Secure-)?next-auth\.session-token=/.test(cookieHeader)
    || /(^|; )next-auth\.session-token=/.test(cookieHeader)
    || /(^|; )authjs\.session-token=/.test(cookieHeader)

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
