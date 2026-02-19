/**
 * Centralized TanStack Query exports
 * All data fetching functionality should be imported from here
 */

export { fetcher, mutationFetcher } from "./fetcher"
export { queryClientConfig, createQueryClient } from "./config"
export { QueryProvider, SWRProvider } from "./provider"

// Hooks organized by module
export * from "./hooks"

