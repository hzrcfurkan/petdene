import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PetManagement } from "@/components/features/pets/PetManagement"

export default async function ClientPetsPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isCustomer) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">My Pets</h1>
					<p className="text-muted-foreground">
						Manage your pets and their information
					</p>
				</header>

				<PetManagement />
			</div>
		</LayoutAdmin>
	)
}

