"use server"

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VisitDetailPage } from "@/components/features/visits/VisitDetailPage"

export default async function CustomerVisitDetailRoute({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	return (
		<LayoutAdmin>
			<VisitDetailPage listHref="/customer/visits" listLabel="My Visits" />
		</LayoutAdmin>
	)
}
