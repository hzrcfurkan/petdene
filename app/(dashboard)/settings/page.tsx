import LayoutAdmin from "@/components/layout/admin"
import { SettingsForm } from "@/components/features/settings/SettingsForm"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	return (
		<LayoutAdmin>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
					<SettingsForm />
				</div>
			</div>
		</LayoutAdmin>
	)
}
