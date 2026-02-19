"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PetServiceImport } from "@/components/features/pet-services/PetServiceImport"

export default async function PetServiceImportPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Import Services</h1>
					<p className="text-muted-foreground">
						Bulk import pet services from CSV or Excel files
					</p>
				</header>

				<PetServiceImport />
			</div>
		</LayoutAdmin>
	)
}

