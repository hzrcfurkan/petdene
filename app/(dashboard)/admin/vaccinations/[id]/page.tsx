import LayoutAdmin from "@/components/layout/admin"
import { VaccinationDetailPage } from "@/components/features/vaccinations/VaccinationDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminVaccinationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<VaccinationDetailPage listHref="/admin/vaccinations" listLabel="Vaccinations" />
		</LayoutAdmin>
	)
}
