"use client"

import { useMemo } from "react"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { useAppointments } from "@/lib/react-query"
import { useOrders } from "@/lib/react-query/hooks/orders"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
	Stethoscope, Calendar, ClipboardList, PawPrint,
	Clock, CheckCircle2, AlertCircle, ArrowRight, Activity,
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

export function DoctorDashboard() {
	const currentUser = currentUserClient()
	const now = new Date()
	const todayStr = format(now, "yyyy-MM-dd")

	const { data: visitsData }      = useVisits({ limit: 100 })
	const { data: appointmentsData } = useAppointments({ limit: 100 })
	const { data: pendingOrders }   = useOrders({ status: "PENDING",     limit: 100 })
	const { data: progressOrders }  = useOrders({ status: "IN_PROGRESS", limit: 100 })

	const visits      = visitsData?.visits      || []
	const appointments = appointmentsData?.appointments || []
	const pending     = pendingOrders?.orders   || []
	const inProgress  = progressOrders?.orders  || []

	const todayAppointments = useMemo(() =>
		appointments.filter(a => format(new Date(a.date), "yyyy-MM-dd") === todayStr)
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	, [appointments, todayStr])

	const activeVisits = useMemo(() =>
		visits.filter(v => v.status === "IN_PROGRESS" || v.status === "PENDING")
	, [visits])

	const todayCompleted = useMemo(() =>
		visits.filter(v => v.status === "COMPLETED" && format(new Date(v.visitDate), "yyyy-MM-dd") === todayStr)
	, [visits, todayStr])

	const urgentOrders = useMemo(() =>
		[...pending, ...inProgress].filter(o => o.priority === "URGENT")
	, [pending, inProgress])

	const allOpenOrders = [...pending, ...inProgress]

	return (
		<div className="ad-wrap">
			{/* Başlık */}
			<div className="ad-hd">
				<div>
					<h1 className="ad-hd-title">Doktor Paneli</h1>
					<p className="ad-hd-sub">
						{format(now, "d MMMM yyyy, EEEE", { locale: tr })} — Hoş geldiniz, {currentUser?.name?.split(" ")[0] || "Doktor"}
					</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<Link href="/admin/visits/new" className="sa-mgmt-btn">
						<Stethoscope className="w-4 h-4" /> Yeni Ziyaret
					</Link>
					<span className="ad-live"><span className="ad-live-dot" />Canlı</span>
				</div>
			</div>

			{/* Acil order uyarısı */}
			{urgentOrders.length > 0 && (
				<div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-300 rounded-2xl" style={{ animation: "pulse 2s infinite" }}>
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
						icon:  <Calendar className="w-5 h-5" />,
						color: "blue",
						label: "Bugünkü Randevular",
						val:   todayAppointments.length,
						sub:   `${todayAppointments.filter(a => a.status === "PENDING").length} onay bekliyor`,
					},
					{
						icon:  <Activity className="w-5 h-5" />,
						color: "teal",
						label: "Aktif Ziyaretler",
						val:   activeVisits.length,
						sub:   "Devam eden muayeneler",
					},
					{
						icon:  <CheckCircle2 className="w-5 h-5" />,
						color: "violet",
						label: "Bugün Tamamlanan",
						val:   todayCompleted.length,
						sub:   "Muayene tamamlandı",
					},
					{
						icon:  <ClipboardList className="w-5 h-5" />,
						color: "amber",
						label: "Bekleyen Orderlar",
						val:   allOpenOrders.length,
						sub:   `${urgentOrders.length} acil`,
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
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Son Aktif Ziyaretler */}
			<div className="ad-panel">
				<div className="ad-panel-hd">
					<h3 className="ad-panel-title"><Stethoscope className="w-4 h-4" />Aktif Ziyaretler</h3>
					<Link href="/admin/visits" className="ad-link">Tümünü Gör →</Link>
				</div>
				<div className="ad-visits">
					{activeVisits.length === 0 ? (
						<div className="ad-empty">Aktif ziyaret yok</div>
					) : activeVisits.slice(0, 6).map((v: any) => (
						<Link key={v.id} href={`/admin/visits/${v.id}`} className="ad-visit-row" style={{ textDecoration: "none" }}>
							<div className="ad-visit-avatar" style={{ background: "var(--pc-violet-lt)", color: "var(--pc-violet)" }}>
								{(v.pet?.name || "H").charAt(0).toUpperCase()}
							</div>
							<div className="ad-visit-info">
								<p className="ad-visit-pet">{v.pet?.name || "—"}</p>
								<p className="ad-visit-meta">PRO-{v.protocolNumber} · {v.pet?.owner?.name || "—"}</p>
							</div>
							<div className="ad-visit-right">
								<span className={`ad-badge ${visitStatusCfg[v.status]?.cls || "s-pending"}`}>
									{visitStatusCfg[v.status]?.label || v.status}
								</span>
								<p className="ad-visit-meta">{format(new Date(v.visitDate), "HH:mm")}</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}
