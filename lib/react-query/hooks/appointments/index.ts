"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface Appointment {
	id: string
	petId: string
	serviceId: string
	staffId: string | null
	date: string
	status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
	notes: string | null
	createdAt: string
	updatedAt: string
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
	service?: {
		id: string
		title: string
		type: string
		price: number
		duration: number | null
	}
	staff?: {
		id: string
		name: string | null
		email: string
	}
	invoice?: {
		id: string
		amount: number
		status: string
	}
}

export interface AppointmentsResponse {
	appointments: Appointment[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface UseAppointmentsParams {
	page?: number
	limit?: number
	sort?: string
	petId?: string
	serviceId?: string
	staffId?: string
	status?: string
	dateFrom?: string
	dateTo?: string
}

export function useAppointments(params?: UseAppointmentsParams) {
	const queryParams = new URLSearchParams()
	if (params?.page) queryParams.set("page", params.page.toString())
	if (params?.limit) queryParams.set("limit", params.limit.toString())
	if (params?.sort) queryParams.set("sort", params.sort)
	if (params?.petId) queryParams.set("petId", params.petId)
	if (params?.serviceId) queryParams.set("serviceId", params.serviceId)
	if (params?.staffId) queryParams.set("staffId", params.staffId)
	if (params?.status) queryParams.set("status", params.status)
	if (params?.dateFrom) queryParams.set("dateFrom", params.dateFrom)
	if (params?.dateTo) queryParams.set("dateTo", params.dateTo)

	const url = `/api/v1/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

	return useQuery<AppointmentsResponse>({
		queryKey: ["appointments", params],
		queryFn: () => fetcher<AppointmentsResponse>(url),
	})
}

export function useAppointment(id: string) {
	return useQuery<Appointment>({
		queryKey: ["appointments", id],
		queryFn: () => fetcher<Appointment>(`/api/v1/appointments/${id}`),
		enabled: !!id,
	})
}

export function useCreateAppointment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			petId: string
			serviceId: string
			staffId?: string
			date: string
			status?: string
			notes?: string
		}) => mutationFetcher<Appointment>("/api/v1/appointments", { method: "POST", body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] })
		},
	})
}

export function useUpdateAppointment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: {
				petId?: string
				serviceId?: string
				staffId?: string | null
				date?: string
				status?: string
				notes?: string
			}
		}) =>
			mutationFetcher<Appointment>(`/api/v1/appointments/${id}`, {
				method: "PUT",
				body: data,
			}),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] })
			queryClient.invalidateQueries({ queryKey: ["appointments", variables.id] })
		},
	})
}

export function useDeleteAppointment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			mutationFetcher(`/api/v1/appointments/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] })
		},
	})
}

