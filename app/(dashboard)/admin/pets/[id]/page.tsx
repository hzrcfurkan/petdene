import LayoutAdmin from "@/components/layout/admin"
import { PetDetailPage } from "@/components/features/pets/PetDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPetDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<PetDetailPage listHref="/admin/pets" listLabel="Pets" />
		</LayoutAdmin>
	)
}
