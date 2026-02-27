import LayoutAdmin from "@/components/layout/admin"
import { PrescriptionDetailPage } from "@/components/features/prescriptions/PrescriptionDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerPrescriptionDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isCustomer) redirect("/customer")

	return (
		<LayoutAdmin>
			<PrescriptionDetailPage listHref="/customer/prescriptions" listLabel="Prescriptions" />
		</LayoutAdmin>
	)
}
