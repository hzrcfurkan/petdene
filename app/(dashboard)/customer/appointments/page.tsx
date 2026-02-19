import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppointmentManagement } from "@/components/features/appointments/AppointmentManagement"

export default async function ClientAppointmentsPage() {
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
					<h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
					<p className="text-muted-foreground">
						View and manage your pet appointments. Click "New Appointment" to book a visit.
					</p>
				</header>

				<AppointmentManagement />
			</div>
		</LayoutAdmin>
	)
}

