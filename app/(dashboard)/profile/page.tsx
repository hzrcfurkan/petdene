import LayoutAdmin from "@/components/layout/admin"
import { ProfileForm } from "@/components/features/profile/ProfileForm"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
	// Fetch current user from server
	const currentUser = await currentUserServer()

	// Redirect if not logged in
	if (!currentUser) redirect("/signin")

	return (
		<LayoutAdmin>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>
					<ProfileForm />
				</div>
			</div>
		</LayoutAdmin>
	)
}
