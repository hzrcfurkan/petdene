"use server"

import { PrescriptionManagement } from "@/components/features/prescriptions/PrescriptionManagement"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function PrescriptionsPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isAdmin && !currentUser.isSuperAdmin && !currentUser.isStaff) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
					<p className="text-muted-foreground">
						Manage prescriptions, medications, and treatment records
					</p>
				</header>

				<PrescriptionManagement />
			</div>
		</LayoutAdmin>
	)
}

