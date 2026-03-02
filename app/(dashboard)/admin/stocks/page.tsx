

import LayoutAdmin from "@/components/layout/admin"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StockList } from "@/components/features/stocks/StockList"

export const metadata = {
	title: "Stok Yönetimi | PetCare",
}

export default async function StocksPage() {
	const currentUser = await currentUserServer()

	if (!currentUser) {
		redirect("/signin")
	}

	if (!currentUser.isAdmin && !currentUser.isSuperAdmin && !currentUser.isStaff) {
		redirect("/customer")
	}

	return (
		<LayoutAdmin>
			<StockList />
		</LayoutAdmin>
	)
}
