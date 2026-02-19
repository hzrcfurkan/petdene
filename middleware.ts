import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname

	// Get token from NextAuth
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
		// Ensure cookie name matches auth configuration
		cookieName: process.env.NODE_ENV === "production" 
			? "__Secure-next-auth.session-token" 
			: "next-auth.session-token",
	})

	// 🚫 Protected routes - require authentication
	const protectedRoutes = ["/customer", "/admin", "/staff", "/profile", "/settings"]
	const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

	if (isProtectedRoute && !token) {
		const signInUrl = new URL("/signin", request.url)
		signInUrl.searchParams.set("callbackUrl", path)
		return NextResponse.redirect(signInUrl)
	}

	// If no token, allow access to public routes
	if (!token) {
		return NextResponse.next()
	}

	// Get user role from token
	const userRole = (token.role as string) || "CUSTOMER"

	// Role-based access control
	// SUPER ADMIN only routes
	if (path.startsWith("/admin/super")) {
		if (userRole !== "SUPER_ADMIN") {
			// Redirect to appropriate dashboard based on role
			if (userRole === "ADMIN") {
				return NextResponse.redirect(new URL("/admin", request.url))
			}
			if (userRole === "STAFF") {
				return NextResponse.redirect(new URL("/staff", request.url))
			}
			return NextResponse.redirect(new URL("/customer", request.url))
		}
	}

	// ADMIN routes (accessible by ADMIN, SUPER_ADMIN, and STAFF for certain pages)
	if (path.startsWith("/admin") && !path.startsWith("/admin/super")) {
		// STAFF can access specific admin pages: appointments, pets, vaccinations, prescriptions, medical-records, invoices
		const staffAllowedPaths = [
			"/admin/appointments",
			"/admin/pets",
			"/admin/vaccinations",
			"/admin/prescriptions",
			"/admin/medical-records",
			"/admin/invoices",
		]
		const isStaffAllowedPath = staffAllowedPaths.some((allowedPath) => path.startsWith(allowedPath))
		
		if (userRole === "STAFF" && !isStaffAllowedPath) {
			// STAFF can only access specific pages, redirect others to staff dashboard
			return NextResponse.redirect(new URL("/staff", request.url))
		}
		
		if (!["ADMIN", "SUPER_ADMIN", "STAFF"].includes(userRole)) {
			return NextResponse.redirect(new URL("/customer", request.url))
		}
	}

	// STAFF only routes
	if (path.startsWith("/staff")) {
		if (userRole !== "STAFF") {
			if (userRole === "SUPER_ADMIN") {
				return NextResponse.redirect(new URL("/admin/super", request.url))
			}
			if (userRole === "ADMIN") {
				return NextResponse.redirect(new URL("/admin", request.url))
			}
			return NextResponse.redirect(new URL("/customer", request.url))
		}
	}

	// CUSTOMER only routes
	if (path.startsWith("/customer")) {
		if (userRole !== "CUSTOMER") {
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
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/customer/:path*", "/admin/:path*", "/staff/:path*", "/profile/:path*", "/settings/:path*"],
}
