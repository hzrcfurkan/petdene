"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ClipboardList, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useOrders, type OrderStatus } from "@/lib/react-query/hooks/orders"
import { OrderCard } from "./OrderCard"
import { OrderForm } from "./OrderForm"

interface VisitOrdersProps {
	visitId:  string
	petId:    string
	canEdit?: boolean
}

export function VisitOrders({ visitId, petId, canEdit = true }: VisitOrdersProps) {
	const [showCreate, setShowCreate] = useState(false)
	const [filter,     setFilter]     = useState<OrderStatus | "ALL">("ALL")

	const { data, isLoading } = useOrders({ visitId, limit: 100 })
	const orders = data?.orders || []

	const counts = {
		all:       orders.length,
		pending:   orders.filter(o => o.status === "PENDING").length,
		progress:  orders.filter(o => o.status === "IN_PROGRESS").length,
		completed: orders.filter(o => o.status === "COMPLETED").length,
		urgent:    orders.filter(o => o.priority === "URGENT" && o.status !== "COMPLETED" && o.status !== "CANCELLED").length,
	}

	const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter)

	return (
		<div className="space-y-4">
			{/* Başlık + Ekle */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<ClipboardList className="w-5 h-5 text-violet-600" />
					<div>
						<h3 className="font-semibold">Orderlar</h3>
						<p className="text-xs text-muted-foreground">{counts.all} order · {counts.completed} tamamlandı</p>
					</div>
				</div>
				{canEdit && (
					<Button onClick={() => setShowCreate(true)} size="sm" className="bg-violet-600 hover:bg-violet-700">
						<Plus className="w-4 h-4 mr-1" />Yeni Order
					</Button>
				)}
			</div>

			{/* Acil uyarı */}
			{counts.urgent > 0 && (
				<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm">
					<AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
					<span className="text-red-700 font-medium">{counts.urgent} acil order bekliyor!</span>
				</div>
			)}

			{/* Özet sayaçlar */}
			{orders.length > 0 && (
				<div className="flex gap-2 flex-wrap">
					{[
						{ key: "ALL",         label: `Tümü (${counts.all})`,               icon: ClipboardList,  color: "text-gray-600" },
						{ key: "PENDING",     label: `Bekliyor (${counts.pending})`,        icon: Clock,          color: "text-yellow-600" },
						{ key: "IN_PROGRESS", label: `Devam (${counts.progress})`,          icon: AlertCircle,    color: "text-blue-600" },
						{ key: "COMPLETED",   label: `Tamamlandı (${counts.completed})`,    icon: CheckCircle2,   color: "text-green-600" },
					].map(item => (
						<button
							key={item.key}
							type="button"
							onClick={() => setFilter(item.key as any)}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
								${filter === item.key
									? "bg-violet-600 text-white border-violet-600"
									: "bg-white border-gray-200 hover:border-violet-300 text-muted-foreground hover:text-foreground"
								}`}
						>
							<item.icon className="w-3.5 h-3.5" />
							{item.label}
						</button>
					))}
				</div>
			)}

			{/* Order listesi */}
			{isLoading ? (
				<div className="text-center py-8 text-muted-foreground text-sm">Yükleniyor...</div>
			) : filtered.length === 0 ? (
				<div className="rounded-2xl border-2 border-dashed p-10 text-center">
					<ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
					<p className="font-medium text-sm">{orders.length === 0 ? "Henüz order yok" : "Bu filtrede order yok"}</p>
					{canEdit && orders.length === 0 && (
						<p className="text-xs text-muted-foreground mt-1">
							Veteriner hekim "Yeni Order" ile ilaç, tetkik veya prosedür ekleyebilir
						</p>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{filtered.map(order => (
						<OrderCard
							key={order.id}
							order={order}
							canEdit={canEdit}
						/>
					))}
				</div>
			)}

			{/* Oluşturma dialog */}
			<Dialog open={showCreate} onOpenChange={setShowCreate}>
				<DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ClipboardList className="w-5 h-5 text-violet-600" />
							Yeni Order
						</DialogTitle>
					</DialogHeader>
					<OrderForm
						visitId={visitId}
						petId={petId}
						onSuccess={() => setShowCreate(false)}
						onCancel={() => setShowCreate(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	)
}
