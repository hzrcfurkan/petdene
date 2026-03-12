"use server"

import { VaccinationManagement } from "@/components/features/vaccinations/VaccinationManagement"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Syringe } from "lucide-react"

export default async function VaccinationsPage() {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin && !currentUser.isStaff) redirect("/customer")

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				{/* Sayfa başlığı */}
				<div className="flex items-start gap-4">
					<div className="rounded-2xl bg-violet-100 dark:bg-violet-900 p-3 shrink-0">
						<Syringe className="w-6 h-6 text-violet-600 dark:text-violet-300" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Aşı Yönetimi</h1>
						<p className="text-muted-foreground text-sm mt-0.5">
							Aşı kayıtlarını yönetin, planlama yapın ve yaklaşan tarihleri takip edin
						</p>
					</div>
				</div>

				<VaccinationManagement />
			</div>
		</LayoutAdmin>
	)
}
