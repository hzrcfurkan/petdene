
import { VaccinationManagement } from "@/components/features/vaccinations/VaccinationManagement"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ClientVaccinationsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Vaccinations</h1>
					<p className="text-muted-foreground">
						View vaccination records for your pets
					</p>
				</header>

				<div className="rounded-lg border bg-muted/50 p-4">
					<p className="text-sm text-muted-foreground">
						<strong>Note:</strong> Vaccination records are managed by our veterinary staff.
						If you need to add or update a vaccination record, please contact our staff or
						schedule an appointment.
					</p>
				</div>

				<VaccinationManagement />
			</div>
		</LayoutAdmin>
	)
}

