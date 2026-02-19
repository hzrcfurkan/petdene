"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PetServiceManagement } from "@/components/features/pet-services/PetServiceManagement"

export default async function PetServicesPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
					<p className="text-muted-foreground">
						Manage pet services catalog, pricing, and availability
					</p>
				</header>

				<PetServiceManagement />
			</div>
		</LayoutAdmin>
	)
}

