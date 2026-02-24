"use client"

/**
 * Admin mutation hooks for user management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { mutationFetcher } from "../../fetcher"

export interface UpdateUserData {
	name?: string
	email?: string
	phone?: string
	password?: string
}

export interface CreateStaffData {
	name: string
	email: string
	phone: string
	password: string
}

/**
 * Hook providing mutation functions for user management
 */
export function useUserMutations() {
	const queryClient = useQueryClient()

	const updateUserMutation = useMutation({
		mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
			return mutationFetcher(`/api/v1/admin/users/${userId}`, {
				method: "PUT",
				body: data,
			})
		},
		onSuccess: () => {
			// Invalidate relevant queries to refetch data
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
			queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
		},
	})

	const deleteUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			return mutationFetcher(`/api/v1/admin/users/${userId}`, {
				method: "DELETE",
			})
		},
		onSuccess: () => {
			// Invalidate relevant queries to refetch data
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
			queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
		},
	})

	const createStaffMutation = useMutation({
		mutationFn: async (data: CreateStaffData) => {
			return mutationFetcher("/api/v1/admin/users", {
				method: "POST",
				body: data,
			})
		},
		onSuccess: () => {
			// Invalidate relevant queries to refetch data
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
			queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
		},
	})

	const updateUserRoleMutation = useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
			return mutationFetcher("/api/v1/admin/users", {
				method: "PUT",
				body: { userId, role },
			})
		},
		onSuccess: () => {
			// Invalidate relevant queries to refetch data
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
			queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
		},
	})

	return {
		/**
		 * Update user information
		 */
		updateUser: async (userId: string, data: UpdateUserData) => {
			return updateUserMutation.mutateAsync({ userId, data })
		},

		/**
		 * Delete a user
		 */
		deleteUser: async (userId: string) => {
			return deleteUserMutation.mutateAsync(userId)
		},

		/**
		 * Create a new staff member
		 */
		createStaff: async (data: CreateStaffData) => {
			return createStaffMutation.mutateAsync(data)
		},

		/**
		 * Update user role (Super Admin only)
		 */
		updateUserRole: async (userId: string, role: string) => {
			return updateUserRoleMutation.mutateAsync({ userId, role })
		},
	}
}

