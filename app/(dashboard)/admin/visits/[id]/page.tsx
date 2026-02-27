"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VisitDetailPage } from "@/components/features/visits/VisitDetailPage"

export default async function VisitDetailRoute({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isAdmin && !currentUser.isSuperAdmin && !currentUser.isStaff) {
		redirect("/customer")
	}

	const { id } = await params

	return (
		<LayoutAdmin>
			<VisitDetailPage listHref="/admin/visits" listLabel="Visits" />
		</LayoutAdmin>
	)
}
