/**
 * Base URL utility
 * Works for both server-side and client-side
 * Automatically detects environment (local vs production/Vercel)
 */

function getBaseUrl(): string {
	// Server-side: Use environment variables or fallback
	if (typeof window === "undefined") {
		// Check for Vercel URL first (automatically set by Vercel)
		if (process.env.VERCEL_URL) {
			return `https://${process.env.VERCEL_URL}`
		}
		// Production fallback
		if (process.env.NODE_ENV === "production") {
			return "https://petcare.reevix.com"
		}
		// Development
		return "http://localhost:3000"
	}

	// Client-side: Use window.location.origin
	return window.location.origin
}

export const baseUrl = getBaseUrl()
