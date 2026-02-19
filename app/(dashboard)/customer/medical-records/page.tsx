
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MedicalRecordManagement } from "@/components/features/medical-records/MedicalRecordManagement"

export default async function ClientMedicalRecordsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
					<p className="text-muted-foreground">
						View medical records for your pets
					</p>
				</header>

				<MedicalRecordManagement />
			</div>
		</LayoutAdmin>
	)
}

