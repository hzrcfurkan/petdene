import { SuperAdminDashboard } from "@/components/features/admin/SuperAdminDashboard"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SuperAdminPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) redirect("/signin")
	if (!currentUser.isSuperAdmin) redirect("/customer")

	return (
		<LayoutAdmin>
			<SuperAdminDashboard />
		</LayoutAdmin>
	)
}
