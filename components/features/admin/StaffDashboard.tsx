"use client"

import { EnhancedStaffDashboard, DashboardManagementSection } from "@/components/features/dashboard"
import { AppointmentManagement } from "@/components/features/appointments/AppointmentManagement"
import { PetManagement } from "@/components/features/pets/PetManagement"
import { VaccinationManagement } from "@/components/features/vaccinations/VaccinationManagement"
import { PrescriptionManagement } from "@/components/features/prescriptions/PrescriptionManagement"
import { InvoiceManagement } from "@/components/features/invoices/InvoiceManagement"
import { OrderManagement } from "@/components/features/orders/OrderManagement"
import { useOrders } from "@/lib/react-query/hooks/orders"
import { AlertCircle, ClipboardList, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

function OrderAlertBanner() {
	const { data: pendingData }  = useOrders({ status: "PENDING",     limit: 100 })
	const { data: progressData } = useOrders({ status: "IN_PROGRESS", limit: 100 })

	const pending  = pendingData?.orders  || []
	const progress = progressData?.orders || []
	const urgent   = [...pending, ...progress].filter(o => o.priority === "URGENT")
	const total    = pending.length + progress.length

	if (total === 0) return null

	return (
		<div className="space-y-2">
			{urgent.length > 0 && (
				<div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-300 rounded-2xl animate-pulse">
					<div className="flex items-center gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
						<div>
							<p className="font-bold text-red-800">⚠️ {urgent.length} Acil Order!</p>
							<p className="text-sm text-red-700">{urgent.slice(0, 3).map(o => `${o.pet.name}: ${o.title}`).join(" · ")}</p>
						</div>
					</div>
					<Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline">
						Görüntüle <ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			)}
			<div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
				<div className="flex items-center gap-3">
					<Clock className="w-5 h-5 text-yellow-600 shrink-0" />
					<div>
						<p className="font-semibold text-yellow-800">
							{pending.length} bekleyen · {progress.length} devam eden order
						</p>
						<p className="text-xs text-yellow-700">
							{pending.slice(0, 3).map(o => o.pet.name).filter((v, i, a) => a.indexOf(v) === i).join(", ")} için bekleyen orderlar var
						</p>
					</div>
				</div>
				<Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-yellow-700 hover:underline">
					Tüm Orderlar <ArrowRight className="w-4 h-4" />
				</Link>
			</div>
		</div>
	)
}

export function StaffDashboard() {
	return (
		<div className="space-y-8">
			{/* Bekleyen order bildirimleri - en üstte */}
			<OrderAlertBanner />

			<EnhancedStaffDashboard />
			
			<div className="mt-8 space-y-8">
				<DashboardManagementSection title="📋 Orderlar">
					<OrderManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Son Randevular">
					<AppointmentManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Hastalar">
					<PetManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Aşı Yönetimi">
					<VaccinationManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Reçeteler">
					<PrescriptionManagement />
				</DashboardManagementSection>

				<DashboardManagementSection title="Faturalar">
					<InvoiceManagement />
				</DashboardManagementSection>
			</div>
		</div>
	)
}
