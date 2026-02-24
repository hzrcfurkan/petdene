"use client"

/**
 * User-related TanStack Query hooks
 */

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "../../fetcher"

export interface UserProfile {
	id: string
	name: string | null
	email: string
	phone: string | null
	image: string | null
	role: string
	createdAt: string
}

/**
 * Hook to fetch current user profile
 */
export function useUserProfile() {
	return useQuery<UserProfile>({
		queryKey: ["user", "profile"],
		queryFn: () => fetcher<UserProfile>("/api/v1/user/profile"),
	})
}

