import LayoutAdmin from "@/components/layout/admin"
import { PetDetailPage } from "@/components/features/pets/PetDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerPetDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isCustomer) redirect("/customer")

	return (
		<LayoutAdmin>
			<PetDetailPage listHref="/customer/pets" listLabel="Hayvanlarım" />
		</LayoutAdmin>
	)
}
