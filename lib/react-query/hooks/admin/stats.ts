"use client"

/**
 * Admin statistics hooks
 */

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "../../fetcher"
import type { StatsResponse } from "./types"

/**
 * Hook to fetch statistics overview
 */
export function useStats() {
	return useQuery<StatsResponse>({
		queryKey: ["admin", "stats"],
		queryFn: () => fetcher<StatsResponse>("/api/v1/admin/users?limit=1000"),
	})
}

