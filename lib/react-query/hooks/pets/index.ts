"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Pet {
	id: string
	ownerId: string
	name: string
	species: string
	breed: string | null
	gender: string | null
	age: number | null
	dateOfBirth: string | null
	weight: number | null
	color: string | null
	image: string | null
	notes: string | null
	createdAt: string
	updatedAt: string
	owner?: {
		id: string
		name: string | null
		email: string
		phone: string | null
	}
	_count?: {
		appointments: number
		vaccinations: number
		medicalLogs: number
		prescriptions: number
	}
}

export interface PetsResponse {
	pets: Pet[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UsePetsParams {
	page?: number
	limit?: number
	sort?: string
	search?: string
	ownerId?: string
	species?: string
}

export function usePets(params?: UsePetsParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.search) queryParams.set("search", params.search)
	if (params?.ownerId) queryParams.set("ownerId", params.ownerId)
	if (params?.species) queryParams.set("species", params.species)

	const url = `/api/v1/pets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<PetsResponse>({
		queryKey: ["pets", params],
		queryFn: () => fetcher<PetsResponse>(url),
	})
}

export function usePet(id: string) {
	return useQuery<Pet>({
		queryKey: ["pets", id],
		queryFn: () => fetcher<Pet>(`/api/v1/pets/${id}`),
		enabled: !!id,
	})
}

export function useCreatePet() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			name: string
			species: string
			breed?: string
			gender?: string
			age?: number
			dateOfBirth?: string
			weight?: number
			color?: string
			image?: string
			notes?: string
			ownerId?: string
		}) => mutationFetcher<Pet>("/api/v1/pets", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

export function useUpdatePet() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				name?: string
				species?: string
				breed?: string
				gender?: string
				age?: number
				dateOfBirth?: string
				weight?: number
				color?: string
				image?: string
				notes?: string
				ownerId?: string
			}
		}) => mutationFetcher<Pet>(`/api/v1/pets/${id}`, { method: "PUT", body: data }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["pets"] })
			queryClient.invalidateQueries({ queryKey: ["pets", variables.id] })
		},
	})
}

export function useDeletePet() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => mutationFetcher(`/api/v1/pets/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pets"] })
		},
	})
}

