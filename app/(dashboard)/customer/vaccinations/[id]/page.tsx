import LayoutAdmin from "@/components/layout/admin"
import { VaccinationDetailPage } from "@/components/features/vaccinations/VaccinationDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerVaccinationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isCustomer) redirect("/customer")

	return (
		<LayoutAdmin>
			<VaccinationDetailPage listHref="/customer/vaccinations" listLabel="Vaccinations" />
		</LayoutAdmin>
	)
}
