"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VisitList } from "@/components/features/visits/VisitList"

export default async function VisitsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Visits (Protocols)</h1>
					<p className="text-muted-foreground">
						Central transaction unit: Patient visits with medical records, services & payments
					</p>
				</header>

				<VisitList showCreate={true} />
			</div>
		</LayoutAdmin>
	)
}
