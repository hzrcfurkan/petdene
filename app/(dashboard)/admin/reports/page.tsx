"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportsView } from "@/components/features/reports/ReportsView"

export default async function ReportsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Finansal Raporlar</h1>
					<p className="text-muted-foreground">
						Daily revenue and total outstanding debt
					</p>
				</header>

				<ReportsView />
			</div>
		</LayoutAdmin>
	)
}
