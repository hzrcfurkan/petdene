"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Visit {
	id: string
	protocolNumber: number
	petId: string
	appointmentId?: string | null
	staffId?: string | null
	visitDate: string
	status: string
	totalAmount: number
	paidAmount: number
	notes?: string | null
	createdAt: string
	updatedAt?: string
	pet?: {
		id: string
		patientNumber?: string
		name: string
		species: string
		breed?: string | null
		owner?: { id: string; name: string | null; email: string; phone?: string | null }
	}
	staff?: { id: string; name: string | null; email: string } | null
	services?: Array<{
		id: string
		serviceId: string
		quantity: number
		unitPrice: number
		total: number
		notes?: string | null
		service: { id: string; title: string; type: string; price: number }
	}>
	medicalRecord?: {
		id: string
		complaints?: string | null
		examinationNotes?: string | null
		diagnosis?: string | null
		treatmentsPerformed?: string | null
		recommendations?: string | null
		title: string
		date: string
	} | null
	payments?: Array<{
		id: string
		method: string
		amount: number
		status: string
		paidAt: string
		notes?: string | null
	}>
}

export interface VisitsResponse {
	visits: Visit[]
	pagination: { total: number; page: number; limit: number; pages: number }
}

export function useVisits(params?: {
	page?: number
	limit?: number
	sort?: string
	petId?: string
	status?: string
	dateFrom?: string
	dateTo?: string
	forInvoice?: boolean
}) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.petId) queryParams.set("petId", params.petId)
	if (params?.status) queryParams.set("status", params.status)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)
	if (params?.forInvoice) queryParams.set("forInvoice", "true")

	const url = `/api/v1/visits${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<VisitsResponse>({
		queryKey: ["visits", params],
		queryFn: () => fetcher<VisitsResponse>(url),
	})
}

export function useVisit(id: string) {
	return useQuery<Visit>({
		queryKey: ["visits", id],
		queryFn: () => fetcher<Visit>(`/api/v1/visits/${id}`),
		enabled: !!id,
	})
}

export function useCreateVisit() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: {
			petId: string
			appointmentId?: string
			staffId?: string
			visitDate: string
			notes?: string
		}) => mutationFetcher<Visit>("/api/v1/visits", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}

export function useAddVisitService(visitId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: {
			serviceId: string
			quantity?: number
			unitPrice?: number
			notes?: string
		}) =>
			mutationFetcher(`/api/v1/visits/${visitId}/services`, {
				method: "POST",
				body: data,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits", visitId] })
			queryClient.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}

export function useRemoveVisitService(visitId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (serviceId: string) =>
			mutationFetcher(`/api/v1/visits/${visitId}/services/${serviceId}`, {
				method: "DELETE",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits", visitId] })
			queryClient.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}

export function useAddVisitPayment(visitId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { method: string; amount: number; notes?: string }) =>
			mutationFetcher(`/api/v1/visits/${visitId}/payments`, {
				method: "POST",
				body: data,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits", visitId] })
			queryClient.invalidateQueries({ queryKey: ["visits"] })
			queryClient.invalidateQueries({ queryKey: ["reports"] })
			queryClient.invalidateQueries({ queryKey: ["payments", "unpaid"] })
		},
	})
}

export function useSaveVisitMedicalRecord(visitId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: {
			complaints?: string
			examinationNotes?: string
			diagnosis?: string
			treatmentsPerformed?: string
			recommendations?: string
			title?: string
		}) =>
			mutationFetcher(`/api/v1/visits/${visitId}/medical-record`, {
				method: "POST",
				body: data,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits", visitId] })
		},
	})
}

export function useDeleteVisitPayment(visitId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (paymentId: string) =>
			mutationFetcher(`/api/v1/visits/${visitId}/payments/${paymentId}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits", visitId] })
			queryClient.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}

export function useUpdateVisitPayment(visitId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ paymentId, ...data }: { paymentId: string; method?: string; amount?: number; notes?: string }) =>
			mutationFetcher(`/api/v1/visits/${visitId}/payments/${paymentId}`, { method: "PUT", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visits", visitId] })
			queryClient.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}
