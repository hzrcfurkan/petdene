"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserManagement } from "@/components/features/admin/UserManagement"
import { StaffManagement } from "@/components/features/admin/StaffManagement"

export default async function RolesPage() {
	const currentUser = await currentUserServer()

	// Redirect if not logged in
	if (!currentUser) redirect("/signin")

	// Only admins and super admins can access
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Team & Access</h1>
					<p className="text-muted-foreground">
						Manage user roles, permissions, and staff members
					</p>
				</header>

				<div className="grid gap-6 lg:grid-cols-2">
					<UserManagement />
					<StaffManagement />
				</div>
			</div>
		</LayoutAdmin>
	)
}
