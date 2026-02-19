"use server"

import { MedicalRecordManagement } from "@/components/features/medical-records/MedicalRecordManagement"
import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MedicalRecordsPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isAdmin && !currentUser.isSuperAdmin && !currentUser.isStaff) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Medical Records Management</h1>
					<p className="text-muted-foreground">
						Manage medical records, diagnoses, and treatment plans
					</p>
				</header>

				<MedicalRecordManagement />
			</div>
		</LayoutAdmin>
	)
}

