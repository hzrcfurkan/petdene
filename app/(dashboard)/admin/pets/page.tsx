"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PetManagement } from "@/components/features/pets/PetManagement"

export default async function PetsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Pet Management</h1>
					<p className="text-muted-foreground">
						Manage pets, owners, and pet information
					</p>
				</header>

				<PetManagement />
			</div>
		</LayoutAdmin>
	)
}

