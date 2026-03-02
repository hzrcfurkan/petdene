import LayoutAdmin from "@/components/layout/admin"
import { AppointmentDetailPage } from "@/components/features/appointments/AppointmentDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminAppointmentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<AppointmentDetailPage listHref="/admin/appointments" listLabel="Randevular" />
		</LayoutAdmin>
	)
}
