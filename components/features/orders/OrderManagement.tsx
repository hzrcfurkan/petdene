"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	ClipboardList, Clock, CheckCircle2, AlertCircle,
	Syringe, Activity, Search, RefreshCw
} from "lucide-react"
import { useOrders, type OrderStatus, type OrderType, ORDER_TYPE_LABELS } from "@/lib/react-query/hooks/orders"
import { OrderCard } from "./OrderCard"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export function OrderManagement() {
	const [search,       setSearch]       = useState("")
	const [typeFilter,   setTypeFilter]   = useState<OrderType | "ALL">("ALL")
	const [tab,          setTab]          = useState("pending")

	// Aktif (bekleyen + devam eden)
	const { data: pendingData,   refetch: refetchPending }   = useOrders({ status: "PENDING",     limit: 200 })
	const { data: progressData,  refetch: refetchProgress }  = useOrders({ status: "IN_PROGRESS", limit: 200 })
	const { data: completedData, refetch: refetchCompleted } = useOrders({ status: "COMPLETED",   limit: 200 })
	const { data: todayData,     refetch: refetchToday }     = useOrders({ today: true,            limit: 200 })

	const pending   = pendingData?.orders   || []
	const progress  = progressData?.orders  || []
	const completed = completedData?.orders || []
	const today     = todayData?.orders     || []

	const urgent = [...pending, ...progress].filter(o => o.priority === "URGENT")

	const applyFilter = (orders: typeof pending) => {
		let filtered = orders
		if (typeFilter !== "ALL") filtered = filtered.filter(o => o.type === typeFilter)
		if (search) {
			const s = search.toLowerCase()
			filtered = filtered.filter(o =>
				o.title.toLowerCase().includes(s) ||
				o.pet.name.toLowerCase().includes(s) ||
				o.pet.owner?.name?.toLowerCase().includes(s) ||
				o.description?.toLowerCase().includes(s)
			)
		}
		return filtered
	}

	const refetchAll = () => {
		refetchPending(); refetchProgress(); refetchCompleted(); refetchToday()
	}

	const statsCards = [
		{ label: "Bekleyen",    value: pending.length,  icon: Clock,         color: "text-yellow-600", bg: "bg-yellow-50" },
		{ label: "Devam Eden",  value: progress.length, icon: Activity,      color: "text-blue-600",   bg: "bg-blue-50" },
		{ label: "Tamamlanan",  value: completed.length,icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50" },
		{ label: "Acil",        value: urgent.length,   icon: AlertCircle,   color: "text-red-600",    bg: "bg-red-50" },
	]

	return (
		<div className="space-y-6">
			{/* İstatistik kartları */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{statsCards.map(card => (
					<div key={card.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${card.bg}`}>
						<card.icon className={`w-6 h-6 ${card.color} shrink-0`} />
						<div>
							<p className="text-xs text-muted-foreground">{card.label}</p>
							<p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
						</div>
					</div>
				))}
			</div>

			{/* ACİL banner */}
			{urgent.length > 0 && (
				<div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-2xl animate-pulse">
					<AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
					<div>
						<p className="font-bold text-red-800">⚠️ {urgent.length} Acil Order Bekliyor!</p>
						<p className="text-sm text-red-700">{urgent.map(o => `${o.pet.name}: ${o.title}`).join(" · ")}</p>
					</div>
				</div>
			)}

			{/* Filtreler */}
			<div className="flex gap-3 flex-wrap">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input className="pl-9" placeholder="Hasta adı, order başlığı..." value={search} onChange={e => setSearch(e.target.value)} />
				</div>
				<Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
					<SelectTrigger className="w-40"><SelectValue placeholder="Tüm Tipler" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tüm Tipler</SelectItem>
						{(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map(t => (
							<SelectItem key={t} value={t}>{ORDER_TYPE_LABELS[t]}</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button variant="outline" size="icon" onClick={refetchAll} title="Yenile">
					<RefreshCw className="w-4 h-4" />
				</Button>
			</div>

			{/* Sekmeler */}
			<Tabs value={tab} onValueChange={setTab}>
				<TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1">
					<TabsTrigger value="pending" className="rounded-lg px-4 text-sm">
						<Clock className="w-3.5 h-3.5 mr-1.5" />
						Bekleyenler
						{applyFilter(pending).length > 0 && (
							<Badge className="ml-1.5 bg-yellow-100 text-yellow-700 text-xs">{applyFilter(pending).length}</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="progress" className="rounded-lg px-4 text-sm">
						<Activity className="w-3.5 h-3.5 mr-1.5" />
						Devam Eden
						{applyFilter(progress).length > 0 && (
							<Badge className="ml-1.5 bg-blue-100 text-blue-700 text-xs">{applyFilter(progress).length}</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="today" className="rounded-lg px-4 text-sm">
						<Syringe className="w-3.5 h-3.5 mr-1.5" />
						Bugün
						{today.length > 0 && (
							<Badge className="ml-1.5 bg-violet-100 text-violet-700 text-xs">{today.length}</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="completed" className="rounded-lg px-4 text-sm">
						<CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
						Tamamlananlar
					</TabsTrigger>
				</TabsList>

				{/* Bekleyenler */}
				<TabsContent value="pending" className="mt-4">
					<OrderList orders={applyFilter(pending)} emptyMsg="Bekleyen order yok 🎉" showPet showVisit />
				</TabsContent>

				{/* Devam Eden */}
				<TabsContent value="progress" className="mt-4">
					<OrderList orders={applyFilter(progress)} emptyMsg="Devam eden order yok" showPet showVisit />
				</TabsContent>

				{/* Bugün */}
				<TabsContent value="today" className="mt-4">
					<div className="mb-3 text-sm text-muted-foreground">
						{format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })} — bugün oluşturulan veya planlanan orderlar
					</div>
					<OrderList orders={applyFilter(today)} emptyMsg="Bugün için order yok" showPet showVisit />
				</TabsContent>

				{/* Tamamlananlar */}
				<TabsContent value="completed" className="mt-4">
					<OrderList orders={applyFilter(completed)} emptyMsg="Tamamlanan order yok" showPet showVisit />
				</TabsContent>
			</Tabs>
		</div>
	)
}

function OrderList({ orders, emptyMsg, showPet, showVisit }: {
	orders: any[]; emptyMsg: string; showPet?: boolean; showVisit?: boolean
}) {
	if (orders.length === 0) {
		return (
			<div className="rounded-2xl border-2 border-dashed p-12 text-center">
				<ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
				<p className="text-sm text-muted-foreground">{emptyMsg}</p>
			</div>
		)
	}
	return (
		<div className="space-y-2">
			{orders.map(order => (
				<OrderCard key={order.id} order={order} showPet={showPet} showVisit={showVisit} canEdit />
			))}
		</div>
	)
}
