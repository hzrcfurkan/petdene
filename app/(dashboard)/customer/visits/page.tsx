"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VisitList } from "@/components/features/visits/VisitList"

export default async function CustomerVisitsPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">My Visits</h1>
					<p className="text-muted-foreground">
						View your pet’s clinic visits, medical records, and payments
					</p>
				</header>

				<VisitList showCreate={false} />
			</div>
		</LayoutAdmin>
	)
}
