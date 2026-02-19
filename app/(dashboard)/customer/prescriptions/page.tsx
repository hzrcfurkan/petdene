
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PrescriptionManagement } from "@/components/features/prescriptions/PrescriptionManagement"

export default async function ClientPrescriptionsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
					<p className="text-muted-foreground">
						View prescription records for your pets
					</p>
				</header>

				<PrescriptionManagement />
			</div>
		</LayoutAdmin>
	)
}

