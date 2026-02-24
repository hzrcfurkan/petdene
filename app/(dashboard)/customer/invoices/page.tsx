import { Suspense } from "react"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { InvoiceManagement } from "@/components/features/invoices/InvoiceManagement"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export default async function ClientInvoicesPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isCustomer) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
					<p className="text-muted-foreground">
						View and manage your invoices and payments
					</p>
				</header>

				<Suspense fallback={
					<div className="flex items-center justify-center py-12">
						<LoadingSpinner size="lg" text="Loading invoices..." />
					</div>
				}>
					<InvoiceManagement />
				</Suspense>
			</div>
		</LayoutAdmin>
	)
}

