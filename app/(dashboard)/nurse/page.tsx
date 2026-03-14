import { NurseDashboard } from "@/components/features/dashboard/NurseDashboard"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NursePage() {
	const currentUser = await currentUserServer()

	if (!currentUser) redirect("/signin")
	if (currentUser.isSuperAdmin) redirect("/super")
	if (currentUser.isAdmin)      redirect("/admin")
	if (currentUser.isDoctor)     redirect("/doctor")
	if (!currentUser.isNurse)     redirect("/customer")

	return (
		<LayoutAdmin>
			<NurseDashboard />
		</LayoutAdmin>
	)
}
