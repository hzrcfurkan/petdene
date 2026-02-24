"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Prescription {
	id: string
	petId: string
	issuedById: string
	medicineName: string
	dosage: string | null
	instructions: string | null
	dateIssued: string
	pet?: {
		id: string
		name: string
		species: string
		breed: string | null
		owner?: {
			id: string
			name: string | null
			email: string
		}
	}
	issuedBy?: {
		id: string
		name: string | null
		email: string
	}
}

export interface PrescriptionsResponse {
	prescriptions: Prescription[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UsePrescriptionsParams {
	page?: number
	limit?: number
	sort?: string
	petId?: string
	issuedById?: string
	medicineName?: string
	dateFrom?: string
	dateTo?: string
}

export function usePrescriptions(params?: UsePrescriptionsParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.petId) queryParams.set("petId", params.petId)
	if (params?.issuedById) queryParams.set("issuedById", params.issuedById)
	if (params?.medicineName) queryParams.set("medicineName", params.medicineName)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)

	const url = `/api/v1/prescriptions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<PrescriptionsResponse>({
		queryKey: ["prescriptions", params],
		queryFn: () => fetcher<PrescriptionsResponse>(url),
	})
}

export function usePrescription(id: string) {
	return useQuery<Prescription>({
		queryKey: ["prescriptions", id],
		queryFn: () => fetcher<Prescription>(`/api/v1/prescriptions/${id}`),
		enabled: !!id,
	})
}

export function useCreatePrescription() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			petId: string
			medicineName: string
			dosage?: string
			instructions?: string
			dateIssued?: string
		}) => mutationFetcher<Prescription>("/api/v1/prescriptions", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

export function useUpdatePrescription() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				petId?: string
				medicineName?: string
				dosage?: string | null
				instructions?: string | null
				dateIssued?: string
			}
		}) => mutationFetcher<Prescription>(`/api/v1/prescriptions/${id}`, { method: "PUT", body: data }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
			queryClient.invalidateQueries({ queryKey: ["prescriptions", variables.id] })
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

export function useDeletePrescription() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => mutationFetcher(`/api/v1/prescriptions/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

