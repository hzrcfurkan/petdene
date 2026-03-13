import LayoutAdmin from "@/components/layout/admin"
import { OrderManagement } from "@/components/features/orders/OrderManagement"
import { currentUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ClipboardList } from "lucide-react"

export default async function OrdersPage() {
	const currentUser = await currentUserServer()
	if (!currentUser) redirect("/signin")
	if (!currentUser.isAdmin && !currentUser.isSuperAdmin && !currentUser.isStaff) redirect("/customer")

	return (
		<LayoutAdmin>
			<div className="space-y-8">
				<div className="flex items-start gap-4">
					<div className="rounded-2xl bg-violet-100 dark:bg-violet-900 p-3 shrink-0">
						<ClipboardList className="w-6 h-6 text-violet-600 dark:text-violet-300" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Order Yönetimi</h1>
						<p className="text-muted-foreground text-sm mt-0.5">
							Veteriner orderlarını takip edin — hemşire ve personel uygulandı olarak işaretleyebilir
						</p>
					</div>
				</div>
				<OrderManagement />
			</div>
		</LayoutAdmin>
	)
}
