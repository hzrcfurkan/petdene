import LayoutAdmin from "@/components/layout/admin"
import { PrescriptionDetailPage } from "@/components/features/prescriptions/PrescriptionDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPrescriptionDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<PrescriptionDetailPage listHref="/admin/prescriptions" listLabel="Prescriptions" />
		</LayoutAdmin>
	)
}
