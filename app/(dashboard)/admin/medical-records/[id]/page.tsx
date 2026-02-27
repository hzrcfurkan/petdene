import LayoutAdmin from "@/components/layout/admin"
import { MedicalRecordDetailPage } from "@/components/features/medical-records/MedicalRecordDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminMedicalRecordDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<MedicalRecordDetailPage listHref="/admin/medical-records" listLabel="Medical Records" />
		</LayoutAdmin>
	)
}
