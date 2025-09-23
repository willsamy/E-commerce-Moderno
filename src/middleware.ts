import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Proteger rotas /admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      // callbackUrl precisa ser absoluto para NextAuth redirecionar corretamente
      const base = `${req.nextUrl.protocol}//${req.nextUrl.host}`
      const cb = new URL(pathname, base).toString()
      loginUrl.searchParams.set("callbackUrl", cb)
      return NextResponse.redirect(loginUrl)
    }
    // Opcional: restringir a ADMIN
    if ((token as any).role && (token as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}