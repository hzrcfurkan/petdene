"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRoleLabel, currentUserClient } from "@/lib/auth/client"
import { Search, Shield } from "lucide-react"
import { useState } from "react"
import { useUsers, useUserMutations } from "@/lib/react-query"
import { toast } from "sonner"
import { UserListSkeleton } from "@/components/skeletons"

interface User {
	id: string
	name: string
	email: string
	role: string
	phone: string
	createdAt: string
}

interface UsersResponse {
	users: User[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export function UserManagement() {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "date-asc" | "date-desc">("date-desc")
	const [roleFilter, setRoleFilter] = useState<string>("ALL")
	const [searchQuery, setSearchQuery] = useState("")

	const { data, refetch, isLoading } = useUsers({
		page,
		limit: 10,
		sort: sortBy,
		role: roleFilter === "ALL" ? undefined : roleFilter,
		search: searchQuery,
	})
	const users = data?.users || []
	const pagination = data?.pagination

	const currentUser = currentUserClient()
	const [updatingId, setUpdatingId] = useState<string | null>(null)
	const { updateUserRole } = useUserMutations()

	if (!currentUser) return null

	const currentUserId = currentUser.id
	const currentUserRole = currentUser.role

	const handleRoleChange = async (userId: string, newRole: string) => {
		if (currentUserRole !== "SUPER_ADMIN") {
			toast.error("Only Super Admin can manage roles")
			return
		}

		if (userId === currentUserId) {
			toast.error("You cannot change your own role")
			return
		}

		setUpdatingId(userId)
		try {
			await updateUserRole(userId, newRole)
			toast.success("User role updated successfully")
			refetch()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update user role")
		} finally {
			setUpdatingId(null)
		}
	}

	const handleReset = () => {
		setPage(1)
		setSortBy("date-desc")
		setRoleFilter("ALL")
		setSearchQuery("")
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="w-5 h-5" />
					User Management
				</CardTitle>
				<CardDescription>Manage user roles and permissions (Super Admin only)</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2 flex-wrap">
					<div className="flex-1 min-w-[200px]">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or email..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value)
									setPage(1)
								}}
								className="pl-8"
							/>
						</div>
					</div>
					<Select
						value={sortBy}
						onValueChange={(value: any) => {
							setSortBy(value)
							setPage(1)
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="name-asc">Name (A-Z)</SelectItem>
							<SelectItem value="name-desc">Name (Z-A)</SelectItem>
							<SelectItem value="date-desc">Newest First</SelectItem>
							<SelectItem value="date-asc">Oldest First</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={roleFilter}
						onValueChange={(value) => {
							setRoleFilter(value)
							setPage(1)
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by role..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Roles</SelectItem>
							<SelectItem value="CUSTOMER">Customer</SelectItem>
							<SelectItem value="STAFF">Staff</SelectItem>
							<SelectItem value="ADMIN">Admin</SelectItem>
							<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" onClick={handleReset}>
						Reset
					</Button>
				</div>

				{isLoading ? (
					<UserListSkeleton count={5} />
				) : (
					<div className="space-y-4">
						{users.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
							>
								<div className="flex-1">
									<p className="font-semibold">{user.name}</p>
									<p className="text-sm text-muted-foreground">{user.email}</p>
									{user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
								</div>
								<div className="flex items-center gap-2">
									<Select
										value={user.role}
										onValueChange={(value) => handleRoleChange(user.id, value)}
										disabled={updatingId === user.id || currentUserRole !== "SUPER_ADMIN" || user.id === currentUserId}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="CUSTOMER">{getRoleLabel("CUSTOMER")}</SelectItem>
											<SelectItem value="STAFF">{getRoleLabel("STAFF")}</SelectItem>
											<SelectItem value="ADMIN">{getRoleLabel("ADMIN")}</SelectItem>
											<SelectItem value="SUPER_ADMIN">{getRoleLabel("SUPER_ADMIN")}</SelectItem>
										</SelectContent>
									</Select>
									{user.id === currentUserId && <span className="text-xs text-muted-foreground">(You)</span>}
								</div>
							</div>
						))}
					</div>
				)}

				{pagination && pagination.pages > 1 && (
					<div className="flex items-center justify-between pt-4 border-t">
						<p className="text-sm text-muted-foreground">
							Page {pagination.page} of {pagination.pages} ({pagination.total} total)
						</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(Math.min(pagination.pages, page + 1))}
								disabled={page === pagination.pages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
