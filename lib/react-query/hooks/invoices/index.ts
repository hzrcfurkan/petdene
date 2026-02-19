"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Invoice {
	id: string
	appointmentId: string
	amount: number
	status: "UNPAID" | "PAID" | "CANCELLED"
	createdAt: string
	appointment?: {
		id: string
		date: string
		status: string
		pet: {
			id: string
			name: string
			species: string
			owner?: {
				id: string
				name: string | null
				email: string
			}
		}
		service: {
			id: string
			title: string
			price: number
		}
	}
	payment?: {
		id: string
		method: string
		amount: number
		paidAt: string | null
		transactionId: string | null
		status?: string
	}
}

export interface InvoicesResponse {
	invoices: Invoice[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UseInvoicesParams {
	page?: number
	limit?: number
	sort?: string
	appointmentId?: string
	status?: string
	ownerId?: string
	dateFrom?: string
	dateTo?: string
}

export function useInvoices(params?: UseInvoicesParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.appointmentId) queryParams.set("appointmentId", params.appointmentId)
	if (params?.status) queryParams.set("status", params.status)
	if (params?.ownerId) queryParams.set("ownerId", params.ownerId)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)

	const url = `/api/v1/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<InvoicesResponse>({
		queryKey: ["invoices", params],
		queryFn: () => fetcher<InvoicesResponse>(url),
	})
}

export function useInvoice(id: string) {
	return useQuery<Invoice>({
		queryKey: ["invoices", id],
		queryFn: () => fetcher<Invoice>(`/api/v1/invoices/${id}`),
		enabled: !!id,
	})
}

export function useCreateInvoice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			appointmentId: string
			amount: number
			status?: "UNPAID" | "PAID" | "CANCELLED"
		}) => mutationFetcher<Invoice>("/api/v1/invoices", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] })
			queryClient.invalidateQueries({ queryKey: ["appointments"] })
		},
	})
}

export function useUpdateInvoice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				amount?: number
				status?: "UNPAID" | "PAID" | "CANCELLED"
			}
		}) => mutationFetcher<Invoice>(`/api/v1/invoices/${id}`, { method: "PUT", body: data }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] })
			queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] })
			queryClient.invalidateQueries({ queryKey: ["appointments"] })
		},
	})
}

export function useDeleteInvoice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => mutationFetcher(`/api/v1/invoices/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] })
			queryClient.invalidateQueries({ queryKey: ["appointments"] })
		},
	})
}

