/**
 * Type definitions for admin-related hooks
 */

export interface User {
	id: string
	name: string
	email: string
	role: string
	phone: string
	createdAt: string
}

export interface UsersResponse {
	users: User[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface StaffResponse {
	users: User[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface StatsResponse {
	users: Array<{ role: string }>
	pagination: { total: number }
}

export interface UseUsersParams {
	page?: number
	limit?: number
	sort?: string
	role?: string
	search?: string
}

export interface UseStaffParams {
	page?: number
	limit?: number
}

