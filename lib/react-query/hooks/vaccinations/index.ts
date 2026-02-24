"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Vaccination {
	id: string
	petId: string
	vaccineName: string
	dateGiven: string
	nextDue: string | null
	notes: string | null
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
}

export interface VaccinationsResponse {
	vaccinations: Vaccination[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UseVaccinationsParams {
	page?: number
	limit?: number
	sort?: string
	petId?: string
	vaccineName?: string
	dateFrom?: string
	dateTo?: string
	upcoming?: boolean
}

export function useVaccinations(params?: UseVaccinationsParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.petId) queryParams.set("petId", params.petId)
	if (params?.vaccineName) queryParams.set("vaccineName", params.vaccineName)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)
	if (params?.upcoming) queryParams.set("upcoming", "true")

	const url = `/api/v1/vaccinations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<VaccinationsResponse>({
		queryKey: ["vaccinations", params],
		queryFn: () => fetcher<VaccinationsResponse>(url),
	})
}

export function useVaccination(id: string) {
	return useQuery<Vaccination>({
		queryKey: ["vaccinations", id],
		queryFn: () => fetcher<Vaccination>(`/api/v1/vaccinations/${id}`),
		enabled: !!id,
	})
}

export function useCreateVaccination() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			petId: string
			vaccineName: string
			dateGiven: string
			nextDue?: string
			notes?: string
		}) => mutationFetcher<Vaccination>("/api/v1/vaccinations", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vaccinations"] })
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

export function useUpdateVaccination() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				petId?: string
				vaccineName?: string
				dateGiven?: string
				nextDue?: string | null
				notes?: string | null
			}
		}) => mutationFetcher<Vaccination>(`/api/v1/vaccinations/${id}`, { method: "PUT", body: data }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["vaccinations"] })
			queryClient.invalidateQueries({ queryKey: ["vaccinations", variables.id] })
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

export function useDeleteVaccination() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => mutationFetcher(`/api/v1/vaccinations/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vaccinations"] })
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

