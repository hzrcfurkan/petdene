import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
	const path = request.nextUrl.pathname

	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
		cookieName: process.env.NODE_ENV === "production"
			? "__Secure-next-auth.session-token"
			: "next-auth.session-token",
	})

	const protectedRoutes = ["/customer", "/admin", "/staff", "/doctor", "/nurse", "/super", "/profile", "/settings"]
	const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

	if (isProtectedRoute && !token) {
		const signInUrl = new URL("/signin", request.url)
		signInUrl.searchParams.set("callbackUrl", path)
		return NextResponse.redirect(signInUrl)
	}

	if (!token) return NextResponse.next()

	const userRole = (token.role as string) || "CUSTOMER"
	// Geriye dönük uyumluluk
	const normalizedRole = userRole === "STAFF" ? "NURSE" : userRole

	// SUPER_ADMIN rotaları
	if (path.startsWith("/super")) {
		if (normalizedRole !== "SUPER_ADMIN") {
			if (normalizedRole === "ADMIN")  return NextResponse.redirect(new URL("/admin",  request.url))
			if (normalizedRole === "DOCTOR") return NextResponse.redirect(new URL("/doctor", request.url))
			if (normalizedRole === "NURSE")  return NextResponse.redirect(new URL("/nurse",  request.url))
			return NextResponse.redirect(new URL("/customer", request.url))
		}
	}

	// ADMIN rotaları
	if (path.startsWith("/admin")) {
		const clinicalAllowedPaths = [
			"/admin/visits",
			"/admin/appointments",
			"/admin/pets",
			"/admin/vaccinations",
			"/admin/prescriptions",
			"/admin/medical-records",
			"/admin/invoices",
			"/admin/payments",
			"/admin/stocks",
			"/admin/orders",
		]
		const isClinicalAllowed = clinicalAllowedPaths.some((p) => path.startsWith(p))

		if ((normalizedRole === "DOCTOR" || normalizedRole === "NURSE") && !isClinicalAllowed) {
			const redirect = normalizedRole === "DOCTOR" ? "/doctor" : "/nurse"
			return NextResponse.redirect(new URL(redirect, request.url))
		}

		if (!["ADMIN", "SUPER_ADMIN", "DOCTOR", "NURSE"].includes(normalizedRole)) {
			return NextResponse.redirect(new URL("/customer", request.url))
		}
	}

	// DOCTOR rotaları
	if (path.startsWith("/doctor")) {
		if (normalizedRole !== "DOCTOR") {
			if (normalizedRole === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super",    request.url))
			if (normalizedRole === "ADMIN")       return NextResponse.redirect(new URL("/admin",    request.url))
			if (normalizedRole === "NURSE")       return NextResponse.redirect(new URL("/nurse",    request.url))
			return NextResponse.redirect(new URL("/customer", request.url))
		}
	}

	// NURSE rotaları (+ eski /staff geriye dönük)
	if (path.startsWith("/nurse") || path.startsWith("/staff")) {
		if (normalizedRole !== "NURSE") {
			if (normalizedRole === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super",  request.url))
			if (normalizedRole === "ADMIN")       return NextResponse.redirect(new URL("/admin",  request.url))
			if (normalizedRole === "DOCTOR")      return NextResponse.redirect(new URL("/doctor", request.url))
			return NextResponse.redirect(new URL("/customer", request.url))
		}
		// /staff isteğini /nurse'e yönlendir
		if (path.startsWith("/staff")) {
			return NextResponse.redirect(new URL("/nurse", request.url))
		}
	}

	// CUSTOMER rotaları
	if (path.startsWith("/customer")) {
		if (normalizedRole !== "CUSTOMER") {
			if (normalizedRole === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super",  request.url))
			if (normalizedRole === "ADMIN")       return NextResponse.redirect(new URL("/admin",  request.url))
			if (normalizedRole === "DOCTOR")      return NextResponse.redirect(new URL("/doctor", request.url))
			if (normalizedRole === "NURSE")       return NextResponse.redirect(new URL("/nurse",  request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/customer/:path*", "/admin/:path*", "/staff/:path*", "/doctor/:path*", "/nurse/:path*", "/super/:path*", "/profile/:path*", "/settings/:path*"],
}
