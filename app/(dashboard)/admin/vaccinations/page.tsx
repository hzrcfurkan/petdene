"use server"

import { VaccinationManagement } from "@/components/features/vaccinations/VaccinationManagement"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function VaccinationsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Vaccination Management</h1>
					<p className="text-muted-foreground">
						Manage vaccination records and track upcoming due dates
					</p>
				</header>

				<VaccinationManagement />
			</div>
		</LayoutAdmin>
	)
}

