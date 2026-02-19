import { CustomerDashboard } from "@/components/features/admin/CustomerDashboard"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) redirect("/signin")

	if (currentUser.isSuperAdmin) redirect("/admin/super")
	if (currentUser.isAdmin) redirect("/admin")
	if (currentUser.isStaff) redirect("/staff")

	return (
		<LayoutAdmin>
			<CustomerDashboard />
		</LayoutAdmin>
	)
}

