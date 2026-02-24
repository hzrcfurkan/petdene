"use client"

/**
 * Admin user management hooks
 */

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "../../fetcher"
import type { UsersResponse, UseUsersParams } from "./types"

/**
 * Hook to fetch users list with filtering and pagination
 */
export function useUsers(params?: UseUsersParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.role) queryParams.set("role", params.role)
	if (params?.search) queryParams.set("search", params.search)

	const url = `/api/v1/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<UsersResponse>({
		queryKey: ["admin", "users", params],
		queryFn: () => fetcher<UsersResponse>(url),
	})
}

