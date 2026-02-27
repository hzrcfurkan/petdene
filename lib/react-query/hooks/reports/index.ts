"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "../../fetcher"

export interface CustomerBalance {
	ownerId: string
	ownerName: string
	ownerEmail: string
	totalDebt: number
}

export interface ReportsData {
	dailyRevenue: {
		date: string
		dateTo?: string
		amount: number
		transactionCount: number
	}
	totalOutstandingDebt: number
	customerBalances: CustomerBalance[]
}

export interface UseReportsParams {
	date?: string
	dateFrom?: string
	dateTo?: string
}

export function useReports(params?: UseReportsParams) {
	const queryParams = new URLSearchParams()
	if (params?.date) queryParams.set("date", params.date)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)
	const url = `/api/v1/reports${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
	return useQuery<ReportsData>({
		queryKey: ["reports", params],
		queryFn: () => fetcher<ReportsData>(url),
	})
}
