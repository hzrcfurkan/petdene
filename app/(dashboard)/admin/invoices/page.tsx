"use server"

import { InvoiceManagement } from "@/components/features/invoices/InvoiceManagement"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function InvoicesPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
					<p className="text-muted-foreground">
						Manage invoices, payments, and billing records
					</p>
				</header>

				<InvoiceManagement />
			</div>
		</LayoutAdmin>
	)
}

