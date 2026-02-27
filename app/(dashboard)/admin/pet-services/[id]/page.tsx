import LayoutAdmin from "@/components/layout/admin"
import { PetServiceDetailPage } from "@/components/features/pet-services/PetServiceDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPetServiceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<PetServiceDetailPage listHref="/admin/pet-services" listLabel="Pet Services" />
		</LayoutAdmin>
	)
}
