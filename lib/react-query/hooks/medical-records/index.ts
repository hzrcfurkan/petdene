"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface MedicalRecord {
	id: string
	petId: string
	title: string
	description: string | null
	diagnosis: string | null
	treatment: string | null
	date: string
	pet: {
		id: string
		name: string
		species: string
		owner?: {
			id: string
			name: string
			email: string
		}
	}
}

export interface MedicalRecordsResponse {
	records: MedicalRecord[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UseMedicalRecordsParams {
	page?: number
	limit?: number
	sort?: string
	petId?: string
	title?: string
	dateFrom?: string
	dateTo?: string
}

export function useMedicalRecords(params?: UseMedicalRecordsParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.petId) queryParams.set("petId", params.petId)
	if (params?.title) queryParams.set("title", params.title)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)

	const url = `/api/v1/medical-records${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<MedicalRecordsResponse>({
		queryKey: ["medical-records", params],
		queryFn: () => fetcher<MedicalRecordsResponse>(url),
	})
}

export function useMedicalRecord(id: string) {
	return useQuery<MedicalRecord>({
		queryKey: ["medical-records", id],
		queryFn: () => fetcher<MedicalRecord>(`/api/v1/medical-records/${id}`),
		enabled: !!id,
	})
}

export function useCreateMedicalRecord() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			petId: string
			title: string
			description?: string
			diagnosis?: string
			treatment?: string
			date?: string
		}) => mutationFetcher<MedicalRecord>("/api/v1/medical-records", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["medical-records"] })
		},
	})
}

export function useUpdateMedicalRecord() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				petId?: string
				title?: string
				description?: string
				diagnosis?: string
				treatment?: string
				date?: string
			}
		}) =>
			mutationFetcher<MedicalRecord>(`/api/v1/medical-records/${id}`, {
				method: "PUT",
				body: data,
			}),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["medical-records"] })
			queryClient.invalidateQueries({ queryKey: ["medical-records", variables.id] })
		},
	})
}

export function useDeleteMedicalRecord() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			mutationFetcher<{ message: string }>(`/api/v1/medical-records/${id}`, {
				method: "DELETE",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["medical-records"] })
		},
	})
}

