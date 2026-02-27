import LayoutAdmin from "@/components/layout/admin"
import { InvoiceDetailPage } from "@/components/features/invoices/InvoiceDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminInvoiceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin) redirect("/admin")

	return (
		<LayoutAdmin>
			<InvoiceDetailPage listHref="/admin/invoices" listLabel="Invoices" />
		</LayoutAdmin>
	)
}
