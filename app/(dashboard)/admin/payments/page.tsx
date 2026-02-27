"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PaymentScreen } from "@/components/features/payments/PaymentScreen"

export default async function PaymentsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Payments</h1>
					<p className="text-muted-foreground">
						Record partial payment, full payment, or mark as paid. Customer balance and reports update automatically.
					</p>
				</header>

				<PaymentScreen />
			</div>
		</LayoutAdmin>
	)
}
