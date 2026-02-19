import { QueryClient } from "@tanstack/react-query"
import { fetcher } from "./fetcher"

/**
 * Global TanStack Query configuration
 * - Uses centralized fetcher with cookie support
 * - Configures revalidation and caching strategies
 * - Optimized for fast subsequent loads
 */
export const queryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // Don't refetch when window gets focused
			refetchOnReconnect: true, // Refetch when network reconnects
			refetchOnMount: true, // Refetch if data is stale
			staleTime: 0, // Data is considered stale immediately (can be adjusted)
			gcTime: 5 * 60 * 1000, // Cache time: 5 minutes (formerly cacheTime)
			retry: 3, // Retry failed requests up to 3 times
			retryDelay: 5000, // Wait 5 seconds between retries
		},
		mutations: {
			retry: 1, // Retry mutations once on failure
		},
	},
}

/**
 * Create a new QueryClient instance with the configured options
 */
export function createQueryClient() {
	return new QueryClient(queryClientConfig)
}

