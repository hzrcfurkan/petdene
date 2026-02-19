"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { createQueryClient } from "./config"
import type { ReactNode } from "react"
import { useState } from "react"

interface QueryProviderProps {
	children: ReactNode
}

/**
 * TanStack Query Provider component
 * Wraps the app to provide global QueryClient configuration
 * Includes cookie support and optimized caching
 */
export function QueryProvider({ children }: QueryProviderProps) {
	// Create QueryClient in state to ensure it's only created once per app instance
	const [queryClient] = useState(() => createQueryClient())

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// Export as SWRProvider for backward compatibility during migration
export const SWRProvider = QueryProvider

