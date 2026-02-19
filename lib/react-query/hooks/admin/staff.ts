"use client"

/**
 * Staff management hooks
 */

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "../../fetcher"
import type { StaffResponse, UseStaffParams } from "./types"

/**
 * Hook to fetch staff members list with pagination
 */
export function useStaff(params?: UseStaffParams) {
	const queryParams = new URLSearchParams()
	queryParams.set("role", "STAFF")
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())

	const url = `/api/v1/admin/users?${queryParams.toString()}`

	return useQuery<StaffResponse>({
		queryKey: ["admin", "staff", params],
		queryFn: () => fetcher<StaffResponse>(url),
	})
}

