"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "../../fetcher"

export interface UnpaidVisit {
	id: string
	protocolNumber: number
	visitDate: string
	totalAmount: number
	paidAmount: number
	balance: number
	pet: {
		id: string
		patientNumber?: string
		name: string
		species: string
		owner: {
			id: string
			name: string | null
			email: string
			phone: string | null
		}
	}
}

export interface CustomerBalance {
	ownerId: string
	ownerName: string
	ownerEmail: string
	totalDebt: number
	visitCount: number
}

export interface UnpaidVisitsResponse {
	unpaidVisits: UnpaidVisit[]
	customerBalances: CustomerBalance[]
	totalOutstanding: number
}

export function useUnpaidVisits(params?: { dateFrom?: string; dateTo?: string }) {
	const queryParams = new URLSearchParams()
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)
	const url = `/api/v1/payments/unpaid-visits${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
	return useQuery<UnpaidVisitsResponse>({
		queryKey: ["payments", "unpaid", params],
		queryFn: () => fetcher<UnpaidVisitsResponse>(url),
	})
}
