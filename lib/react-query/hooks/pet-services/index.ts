"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface PetService {
	id: string
	title: string
	type: string
	description: string | null
	duration: number | null
	price: number
	image: string | null
	active: boolean
	createdAt: string
	updatedAt: string
	_count?: {
		appointments: number
	}
}

export interface PetServicesResponse {
	services: PetService[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UsePetServicesParams {
	page?: number
	limit?: number
	sort?: string
	search?: string
	type?: string
	active?: boolean
}

export function usePetServices(params?: UsePetServicesParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.search) queryParams.set("search", params.search)
	if (params?.type) queryParams.set("type", params.type)
	if (params?.active !== undefined) queryParams.set("active", params.active.toString())

	const url = `/api/v1/pet-services${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<PetServicesResponse>({
		queryKey: ["pet-services", params],
		queryFn: () => fetcher<PetServicesResponse>(url),
	})
}

export function usePetService(id: string) {
	return useQuery<PetService>({
		queryKey: ["pet-services", id],
		queryFn: () => fetcher<PetService>(`/api/v1/pet-services/${id}`),
		enabled: !!id,
	})
}

export function useCreatePetService() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			title: string
			type: string
			description?: string
			duration?: number
			price: number
			image?: string
			active?: boolean
		}) => mutationFetcher<PetService>("/api/v1/pet-services", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pet-services"] })
		},
	})
}

export function useUpdatePetService() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				title?: string
				type?: string
				description?: string
				duration?: number
				price?: number
				image?: string
				active?: boolean
			}
		}) => mutationFetcher<PetService>(`/api/v1/pet-services/${id}`, { method: "PUT", body: data }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["pet-services"] })
			queryClient.invalidateQueries({ queryKey: ["pet-services", variables.id] })
		},
	})
}

export function useDeletePetService() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => mutationFetcher(`/api/v1/pet-services/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pet-services"] })
		},
	})
}

