"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PetImport } from "@/components/features/pets/PetImport"

export default async function PetImportPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Import Pets</h1>
					<p className="text-muted-foreground">
						Bulk import pets from CSV or Excel files
					</p>
				</header>

				<PetImport />
			</div>
		</LayoutAdmin>
	)
}

