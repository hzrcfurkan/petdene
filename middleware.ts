import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 🔐 NextAuth token (cookieName override YOK)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 🚫 Auth sayfaları asla korunmasın
  if (
    path.startsWith("/signin") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password")
  ) {
    return NextResponse.next()
  }

  // 🚫 Korunan alanlar
  const protectedRoutes = ["/customer", "/admin", "/staff", "/profile", "/settings"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )

  // Giriş yapılmamışsa signin'e yönlendir
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(signInUrl)
  }

  // Token yok ama public route ise devam
  if (!token) {
    return NextResponse.next()
  }

  const userRole = (token.role as string) || "CUSTOMER"

  // 👑 SUPER ADMIN
  if (path.startsWith("/admin/super") && userRole !== "SUPER_ADMIN") {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    if (userRole === "STAFF") {
      return NextResponse.redirect(new URL("/staff", request.url))
    }
    return NextResponse.redirect(new URL("/customer", request.url))
  }

  // 🏢 ADMIN alanı
  if (path.startsWith("/admin") && !path.startsWith("/admin/super")) {
    const staffAllowedPaths = [
      "/admin/appointments",
      "/admin/pets",
      "/admin/vaccinations",
      "/admin/prescriptions",
      "/admin/medical-records",
      "/admin/invoices",
    ]

    const isStaffAllowedPath = staffAllowedPaths.some((allowedPath) =>
      path.startsWith(allowedPath)
    )

    if (userRole === "STAFF" && !isStaffAllowedPath) {
      return NextResponse.redirect(new URL("/staff", request.url))
    }

    if (!["ADMIN", "SUPER_ADMIN", "STAFF"].includes(userRole)) {
      return NextResponse.redirect(new URL("/customer", request.url))
    }
  }

  // 👨‍⚕️ STAFF
  if (path.startsWith("/staff") && userRole !== "STAFF") {
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/super", request.url))
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/customer", request.url))
  }

  // 👤 CUSTOMER
  if (path.startsWith("/customer") && userRole !== "CUSTOMER") {
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/super", request.url))
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    if (userRole === "STAFF") {
      return NextResponse.redirect(new URL("/staff", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/admin/:path*",
    "/staff/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}
