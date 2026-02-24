"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Payment {
	id: string
	invoiceId: string
	method: string
	transactionId?: string | null
	stripePaymentIntentId?: string | null
	stripeClientSecret?: string | null
	amount: number
	paidAt?: string | null
	status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
	createdAt: string
	updatedAt: string
	invoice?: {
		id: string
		amount: number
		status: string
		appointment?: {
			id: string
			date: string
			pet?: {
				id: string
				name: string
				owner?: {
					id: string
					name: string | null
					email: string
				}
			}
		}
	}
}

export interface PaymentsResponse {
	payments: Payment[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface CreatePaymentData {
	invoiceId: string
	method: "cash" | "stripe"
	amount: number
	transactionId?: string
	paidAt?: string
}

export interface StripePaymentIntentResponse {
	clientSecret: string
	paymentIntentId: string
	paymentId: string
}

export function usePayments(params?: {
	page?: number
	limit?: number
	sort?: string
	invoiceId?: string
	method?: string
}) {
	return useQuery({
		queryKey: ["payments", params],
		queryFn: () => {
			const searchParams = new URLSearchParams()
			if (params?.page) searchParams.set("page", params.page.toString())
			if (params?.limit) searchParams.set("limit", params.limit.toString())
			if (params?.sort) searchParams.set("sort", params.sort)
			if (params?.invoiceId) searchParams.set("invoiceId", params.invoiceId)
			if (params?.method) searchParams.set("method", params.method)

			return fetcher<PaymentsResponse>(`/api/v1/payments?${searchParams.toString()}`)
		},
	})
}

export function usePayment(id: string) {
	return useQuery({
		queryKey: ["payment", id],
		queryFn: () => fetcher<Payment>(`/api/v1/payments/${id}`),
		enabled: !!id,
	})
}

export function useCreatePayment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreatePaymentData) =>
			mutationFetcher<Payment>("/api/v1/payments", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] })
			queryClient.invalidateQueries({ queryKey: ["invoices"] })
		},
	})
}

export function useCreateStripePaymentIntent() {
	return useMutation({
		mutationFn: (invoiceId: string) =>
			mutationFetcher<StripePaymentIntentResponse>("/api/v1/payments/stripe", {
				method: "POST",
				body: JSON.stringify({ invoiceId }),
			}),
	})
}

