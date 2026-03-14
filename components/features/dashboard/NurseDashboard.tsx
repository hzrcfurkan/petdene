"use client"

import { useMemo } from "react"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { useAppointments } from "@/lib/react-query"
import { useOrders } from "@/lib/react-query/hooks/orders"
import { useStocks } from "@/lib/react-query/hooks/stocks"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
	Syringe, ClipboardList, CreditCard, Package,
	Calendar, PawPrint, AlertCircle, ArrowRight, Clock,
} from "lucide-react"
import Link from "next/link"
import currentUserClient from "@/lib/auth/current-user-client"

const visitStatusCfg: Record<string, { label: string; cls: string }> = {
	PENDING:     { label: "Bekliyor",     cls: "s-pending" },
	CONFIRMED:   { label: "Onaylandı",    cls: "s-confirmed" },
	COMPLETED:   { label: "Tamamlandı",   cls: "s-completed" },
	CANCELLED:   { label: "İptal",        cls: "s-cancelled" },
	IN_PROGRESS: { label: "Devam Ediyor", cls: "s-inprogress" },
}

const orderPriorityCfg: Record<string, { label: string; cls: string }> = {
	URGENT: { label: "Acil",   cls: "s-cancelled" },
	HIGH:   { label: "Yüksek", cls: "s-pending" },
	NORMAL: { label: "Normal", cls: "s-confirmed" },
	LOW:    { label: "Düşük",  cls: "s-completed" },
}

export function NurseDashboard() {
	const currentUser = currentUserClient()
	const now = new Date()
	const todayStr = format(now, "yyyy-MM-dd")

	const { data: visitsData }       = useVisits({ limit: 100 })
	const { data: appointmentsData } = useAppointments({ limit: 100 })
	const { data: pendingOrders }    = useOrders({ status: "PENDING",     limit: 100 })
	const { data: progressOrders }   = useOrders({ status: "IN_PROGRESS", limit: 100 })
	const { data: stockData }        = useStocks({ limit: 100 })

	const visits       = visitsData?.visits           || []
	const appointments = appointmentsData?.appointments || []
	const pending      = pendingOrders?.orders         || []
	const inProgress   = progressOrders?.orders        || []
	const stocks       = (stockData as any)?.stocks    || []

	const todayAppointments = useMemo(() =>
		appointments.filter(a => format(new Date(a.date), "yyyy-MM-dd") === todayStr)
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	, [appointments, todayStr])

	const unpaidVisits = useMemo(() =>
		visits.filter(v => v.status !== "CANCELLED" && (v.totalAmount - v.paidAmount) > 0)
	, [visits])

	const allOpenOrders = useMemo(() =>
		[...pending, ...inProgress].sort((a, b) => {
			const priority = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }
			return (priority[a.priority as keyof typeof priority] ?? 2) - (priority[b.priority as keyof typeof priority] ?? 2)
		})
	, [pending, inProgress])

	const urgentOrders = allOpenOrders.filter(o => o.priority === "URGENT")

	const criticalStocks = useMemo(() =>
		stocks.filter((s: any) => s.quantity <= (s.minQuantity || 5))
	, [stocks])

	return (
		<div className="ad-wrap">
			{/* Başlık */}
			<div className="ad-hd">
				<div>
					<h1 className="ad-hd-title">Hemşire Paneli</h1>
					<p className="ad-hd-sub">
						{format(now, "d MMMM yyyy, EEEE", { locale: tr })} — Hoş geldiniz, {currentUser?.name?.split(" ")[0] || "Hemşire"}
					</p>
				</div>
				<span className="ad-live"><span className="ad-live-dot" />Canlı</span>
			</div>

			{/* Acil order uyarısı */}
			{urgentOrders.length > 0 && (
				<div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
					<div className="flex items-center gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
						<div>
							<p className="font-bold text-red-800">⚠️ {urgentOrders.length} Acil Order!</p>
							<p className="text-sm text-red-700">
								{urgentOrders.slice(0, 3).map(o => `${o.pet?.name}: ${o.title}`).join(" · ")}
							</p>
						</div>
					</div>
					<Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline">
						Görüntüle <ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			)}

			{/* KPI Kartları */}
			<div className="ad-kpi-grid">
				{[
					{
						icon:  <ClipboardList className="w-5 h-5" />,
						color: "amber",
						label: "Bekleyen Orderlar",
						val:   allOpenOrders.length,
						sub:   `${urgentOrders.length} acil, ${inProgress.length} devam ediyor`,
					},
					{
						icon:  <Calendar className="w-5 h-5" />,
						color: "blue",
						label: "Bugünkü Randevular",
						val:   todayAppointments.length,
						sub:   `${todayAppointments.filter(a => a.status === "PENDING").length} onay bekliyor`,
					},
					{
						icon:  <CreditCard className="w-5 h-5" />,
						color: "teal",
						label: "Ödeme Bekleyen",
						val:   unpaidVisits.length,
						sub:   "Tahsilat yapılacak ziyaret",
					},
					{
						icon:  <Package className="w-5 h-5" />,
						color: "violet",
						label: "Kritik Stok",
						val:   criticalStocks.length,
						sub:   criticalStocks.length > 0 ? "Azalan ürün var!" : "Stok durumu iyi",
					},
				].map((c, i) => (
					<div key={i} className={`ad-kpi ad-kpi-${c.color}`}>
						<div className={`ad-kpi-icon ad-ki-${c.color}`}>{c.icon}</div>
						<div className="ad-kpi-body">
							<p className="ad-kpi-lbl">{c.label}</p>
							<p className="ad-kpi-val">{c.val}</p>
							<p className="ad-kpi-desc">{c.sub}</p>
						</div>
					</div>
				))}
			</div>

			{/* Alt Panel */}
			<div className="ad-bottom">
				{/* Bekleyen Orderlar */}
				<div className="ad-panel">
					<div className="ad-panel-hd">
						<h3 className="ad-panel-title"><ClipboardList className="w-4 h-4" />Bekleyen Orderlar</h3>
						<Link href="/admin/orders" className="ad-link">Tümünü Gör →</Link>
					</div>
					<div className="ad-visits">
						{allOpenOrders.length === 0 ? (
							<div className="ad-empty">Bekleyen order yok</div>
						) : allOpenOrders.slice(0, 8).map((o: any) => (
							<div key={o.id} className="ad-visit-row">
								<div className="ad-visit-avatar" style={{ background: "var(--pc-amber-lt)", color: "var(--pc-amber)" }}>
									<PawPrint className="w-4 h-4" />
								</div>
								<div className="ad-visit-info">
									<p className="ad-visit-pet">{o.title}</p>
									<p className="ad-visit-meta">{o.pet?.name} · {o.type}</p>
								</div>
								<div className="ad-visit-right">
									<span className={`ad-badge ${orderPriorityCfg[o.priority]?.cls || "s-pending"}`}>
										{orderPriorityCfg[o.priority]?.label || o.priority}
									</span>
									{o.status === "IN_PROGRESS" && (
										<span className="ad-badge s-inprogress">Devam ediyor</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Bugünkü Randevular */}
				<div className="ad-panel">
					<div className="ad-panel-hd">
						<h3 className="ad-panel-title"><Calendar className="w-4 h-4" />Bugünkü Randevular</h3>
						<Link href="/admin/appointments" className="ad-link">Tümünü Gör →</Link>
					</div>
					<div className="ad-visits">
						{todayAppointments.length === 0 ? (
							<div className="ad-empty">Bugün randevu yok</div>
						) : todayAppointments.slice(0, 8).map((a: any) => (
							<div key={a.id} className="ad-visit-row">
								<div className="ad-visit-avatar" style={{ background: "var(--pc-teal-lt)", color: "var(--pc-teal)" }}>
									{(a.petName || a.pet?.name || "H").charAt(0).toUpperCase()}
								</div>
								<div className="ad-visit-info">
									<p className="ad-visit-pet">{a.petName || a.pet?.name || "—"}</p>
									<p className="ad-visit-meta">{a.ownerName || a.user?.name || "—"}</p>
								</div>
								<div className="ad-visit-right">
									<span className={`ad-badge ${visitStatusCfg[a.status]?.cls || "s-pending"}`}>
										{visitStatusCfg[a.status]?.label || a.status}
									</span>
									<p className="ad-visit-meta">{format(new Date(a.date), "HH:mm")}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Ödeme Bekleyen Ziyaretler */}
			{unpaidVisits.length > 0 && (
				<div className="ad-panel">
					<div className="ad-panel-hd">
						<h3 className="ad-panel-title"><CreditCard className="w-4 h-4" />Ödeme Bekleyen Ziyaretler</h3>
						<Link href="/admin/visits" className="ad-link">Tümünü Gör →</Link>
					</div>
					<div className="ad-visits">
						{unpaidVisits.slice(0, 6).map((v: any) => (
							<Link key={v.id} href={`/admin/visits/${v.id}`} className="ad-visit-row" style={{ textDecoration: "none" }}>
								<div className="ad-visit-avatar" style={{ background: "var(--pc-teal-lt)", color: "var(--pc-teal)" }}>
									{(v.pet?.name || "H").charAt(0).toUpperCase()}
								</div>
								<div className="ad-visit-info">
									<p className="ad-visit-pet">{v.pet?.name || "—"}</p>
									<p className="ad-visit-meta">PRO-{v.protocolNumber} · {v.pet?.owner?.name || "—"}</p>
								</div>
								<div className="ad-visit-right">
									<span className="ad-badge s-pending">
										{(v.totalAmount - v.paidAmount).toFixed(2)} ₺ kalan
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Kritik Stok */}
			{criticalStocks.length > 0 && (
				<div className="ad-panel">
					<div className="ad-panel-hd">
						<h3 className="ad-panel-title"><Package className="w-4 h-4" />Kritik Stok Uyarısı</h3>
						<Link href="/admin/stocks" className="ad-link">Stokları Gör →</Link>
					</div>
					<div className="ad-visits">
						{criticalStocks.slice(0, 6).map((s: any) => (
							<div key={s.id} className="ad-visit-row">
								<div className="ad-visit-avatar" style={{ background: "var(--pc-violet-lt)", color: "var(--pc-violet)" }}>
									<Package className="w-4 h-4" />
								</div>
								<div className="ad-visit-info">
									<p className="ad-visit-pet">{s.name}</p>
									<p className="ad-visit-meta">{s.category || "—"}</p>
								</div>
								<div className="ad-visit-right">
									<span className="ad-badge s-cancelled">
										{s.quantity} {s.unit} kaldı
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
