import LayoutAdmin from "@/components/layout/admin"
import { AppointmentDetailPage } from "@/components/features/appointments/AppointmentDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerAppointmentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isCustomer) redirect("/customer")

	return (
		<LayoutAdmin>
			<AppointmentDetailPage listHref="/customer/appointments" listLabel="Randevularım" />
		</LayoutAdmin>
	)
}
