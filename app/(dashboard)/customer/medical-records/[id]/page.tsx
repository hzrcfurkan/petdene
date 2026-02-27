import LayoutAdmin from "@/components/layout/admin"
import { MedicalRecordDetailPage } from "@/components/features/medical-records/MedicalRecordDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerMedicalRecordDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isCustomer) redirect("/customer")

	return (
		<LayoutAdmin>
			<MedicalRecordDetailPage listHref="/customer/medical-records" listLabel="Medical Records" />
		</LayoutAdmin>
	)
}
