import LayoutAdmin from "@/components/layout/admin"
import { InvoiceDetailPage } from "@/components/features/invoices/InvoiceDetailPage"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerInvoiceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isCustomer) redirect("/customer")

	return (
		<LayoutAdmin>
			<InvoiceDetailPage listHref="/customer/invoices" listLabel="Faturalarım" />
		</LayoutAdmin>
	)
}
