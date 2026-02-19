/**
 * Centralized TanStack Query fetcher with authentication support
 * Automatically includes cookies for authenticated requests
 */

export interface FetcherError extends Error {
	status?: number
	info?: any
}

export async function fetcher<T = any>(url: string): Promise<T> {
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include", // Include cookies for authentication
		cache: "no-store", // Always fetch fresh data, but TanStack Query will cache it
	})

	if (!res.ok) {
		const error: FetcherError = new Error("An error occurred while fetching the data.")
		error.status = res.status
		try {
			error.info = await res.json()
		} catch {
			error.info = { message: res.statusText }
		}
		throw error
	}

	return res.json()
}

/**
 * Fetcher for POST/PUT/DELETE requests
 */
export async function mutationFetcher<T = any>(
	url: string,
	options: {
		method?: "POST" | "PUT" | "DELETE" | "PATCH"
		body?: any
		headers?: Record<string, string>
	} = {}
): Promise<T> {
	const { method = "POST", body, headers = {} } = options

	const res = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		credentials: "include",
		body: body ? JSON.stringify(body) : undefined,
	})

	if (!res.ok) {
		const error: FetcherError = new Error("An error occurred while performing the operation.")
		error.status = res.status
		try {
			error.info = await res.json()
		} catch {
			error.info = { message: res.statusText }
		}
		throw error
	}

	// Handle empty responses
	const text = await res.text()
	if (!text) {
		return {} as T
	}

	return JSON.parse(text)
}

