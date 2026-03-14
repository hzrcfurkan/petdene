import { DoctorDashboard } from "@/components/features/dashboard/DoctorDashboard"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DoctorPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) redirect("/signin")
	if (currentUser.isSuperAdmin) redirect("/super")
	if (currentUser.isAdmin)      redirect("/admin")
	if (currentUser.isNurse)      redirect("/nurse")
	if (!currentUser.isDoctor)    redirect("/customer")

	return (
		<LayoutAdmin>
			<DoctorDashboard />
		</LayoutAdmin>
	)
}
