import { StaffDashboard } from "@/components/features/admin/StaffDashboard"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function StaffPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) redirect("/signin")

	if (currentUser.isSuperAdmin) redirect("/admin/super")
	if (currentUser.isAdmin) redirect("/admin")
	if (!currentUser.isStaff) redirect("/customer")

	return (
		<LayoutAdmin>
			<StaffDashboard />
		</LayoutAdmin>
	)
}
