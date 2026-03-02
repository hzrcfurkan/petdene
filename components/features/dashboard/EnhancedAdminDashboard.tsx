"use client"

import { useMemo } from "react"
import { useAppointments, usePets, useInvoices, usePetServices, useVaccinations } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { format } from "date-fns"
import {
	Calendar, PawPrint, TrendingUp, Clock,
	AlertCircle, Syringe, FileText, Sparkles,
	DollarSign, ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { useVisits } from "@/lib/react-query/hooks/visits"

const statusConfig: Record<string, { label: string; cls: string }> = {
	PENDING:    { label: "Bekliyor",      cls: "s-pending" },
	CONFIRMED:  { label: "Onaylandı",     cls: "s-confirmed" },
	COMPLETED:  { label: "Tamamlandı",    cls: "s-completed" },
	CANCELLED:  { label: "İptal",         cls: "s-cancelled" },
	IN_PROGRESS:{ label: "Devam Ediyor",  cls: "s-inprogress" },
}

export function EnhancedAdminDashboard() {
	const { formatCurrency } = useCurrency()
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })
	const { data: servicesData } = usePetServices({ limit: 1000 })
	const { data: vaccinationsData } = useVaccinations({ limit: 1000 })
	const { data: visitsData } = useVisits({ limit: 8 })

	const appointments = appointmentsData?.appointments || []
	const pets         = petsData?.pets || []
	const invoices     = invoicesData?.invoices || []
	const services     = servicesData?.services || []
	const vaccinations = vaccinationsData?.vaccinations || []
	const visits       = visitsData?.visits || []

	const now           = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const prevThirtyDays= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

	const stats = useMemo(() => {
		const recentAppts  = appointments.filter(a => new Date(a.date) >= thirtyDaysAgo)
		const prevAppts    = appointments.filter(a => new Date(a.date) >= prevThirtyDays && new Date(a.date) < thirtyDaysAgo)
		const paidInvoices = invoices.filter(i => i.status === "Ödendi")
		const unpaidInvs   = invoices.filter(i => i.status === "Ödenmedi")
		const pending      = appointments.filter(a => a.status === "Beklemede")
		const upcoming     = appointments.filter(a => new Date(a.date) >= now && ["Beklemede","Onaylandı"].includes(a.status))
		const overdue      = vaccinations.filter(v => v.nextDue && new Date(v.nextDue) < now)
		const totalRev     = paidInvoices.reduce((s, i) => s + i.amount, 0)
		const unpaidAmt    = unpaidInvs.reduce((s, i) => s + i.amount, 0)
		const monthRev     = invoices.filter(i => new Date(i.createdAt) >= thirtyDaysAgo && i.status === "Ödendi").reduce((s,i)=>s+i.amount,0)
		const prevRev      = invoices.filter(i => new Date(i.createdAt) >= prevThirtyDays && new Date(i.createdAt) < thirtyDaysAgo && i.status === "Ödendi").reduce((s,i)=>s+i.amount,0)
		const revChange    = prevRev > 0 ? ((monthRev - prevRev) / prevRev) * 100 : 0
		const apptChange   = prevAppts.length > 0 ? ((recentAppts.length - prevAppts.length) / prevAppts.length) * 100 : 0
		return {
			recentAppts: recentAppts.length, totalPets: pets.length, totalRev, monthRev,
			unpaidAmt, unpaidCount: unpaidInvs.length, pending: pending.length,
			upcoming: upcoming.length, overdue: overdue.length,
			activeServices: services.filter(s => s.active).length, revChange, apptChange,
		}
	}, [appointments, pets, invoices, vaccinations, services])

	const chartData = useMemo(() => {
		const apptChart = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(now); d.setDate(d.getDate() - (6 - i))
			return { name: format(d, "dd MMM"), value: appointments.filter(a => format(new Date(a.date),"yyyy-MM-dd") === format(d,"yyyy-MM-dd")).length }
		})
		const revChart = Array.from({ length: 6 }, (_, i) => {
			const d = new Date(now); d.setMonth(d.getMonth() - (5 - i))
			return { name: format(d, "MMM yy"), value: invoices.filter(inv => format(new Date(inv.createdAt),"yyyy-MM") === format(d,"yyyy-MM") && inv.status==="Ödendi").reduce((s,inv)=>s+inv.amount,0) }
		})
		const statusCounts: Record<string,number> = {}
		appointments.forEach(a => { statusCounts[a.status] = (statusCounts[a.status]||0)+1 })
		const statusChart = Object.entries(statusCounts).map(([name,value])=>({name,value}))
		const serviceCounts: Record<string,number> = {}
		appointments.forEach(a => { const n=a.service?.title||"Diğer"; serviceCounts[n]=(serviceCounts[n]||0)+1 })
		const serviceChart = Object.entries(serviceCounts).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,5)
		return { appt: apptChart, rev: revChart, status: statusChart, service: serviceChart }
	}, [appointments, invoices])

	const alerts = useMemo(() => {
		const r = []
		if (stats.pending > 0)    r.push({ text: `${stats.pending} randevu onay bekliyor`, t: "warn" })
		if (stats.overdue > 0)    r.push({ text: `${stats.overdue} aşı tarihi geçmiş`, t: "danger" })
		if (stats.unpaidCount > 0) r.push({ text: `${stats.unpaidCount} ödenmemiş fatura · ${formatCurrency(stats.unpaidAmt)}`, t: "warn" })
		return r
	}, [stats])

	return (
		<div className="ad-wrap">
			{/* Header */}
			<div className="ad-hd">
				<div>
					<h1 className="ad-hd-title">Genel Bakış</h1>
					<p className="ad-hd-sub">{format(now, "d MMMM yyyy")} — Veteriner Yönetim Paneli</p>
				</div>
				<span className="ad-live"><span className="ad-live-dot" />Canlı</span>
			</div>

			{/* Alerts */}
			{alerts.length > 0 && (
				<div className="ad-alerts">
					{alerts.map((a, i) => (
						<div key={i} className={`ad-alert ad-alert-${a.t}`}>
							<AlertCircle className="w-4 h-4 shrink-0" />{a.text}
						</div>
					))}
				</div>
			)}

			{/* KPI Cards */}
			<div className="ad-kpi-grid">
				{[
					{
						icon: <DollarSign className="w-5 h-5" />, color: "blue",
						label: "Aylık Gelir", value: formatCurrency(stats.monthRev),
						change: stats.revChange, desc: `Toplam: ${formatCurrency(stats.totalRev)}`,
					},
					{
						icon: <Calendar className="w-5 h-5" />, color: "teal",
						label: "Bu Ay Randevu", value: stats.recentAppts,
						change: stats.apptChange, desc: `${stats.upcoming} yaklaşan`,
					},
					{
						icon: <PawPrint className="w-5 h-5" />, color: "violet",
						label: "Kayıtlı Hasta", value: stats.totalPets,
						change: null, desc: `${stats.activeServices} aktif hizmet`,
					},
					{
						icon: <Clock className="w-5 h-5" />, color: "amber",
						label: "Onay Bekleyen", value: stats.pending,
						change: null, desc: `${stats.upcoming} yaklaşan randevu`,
					},
				].map((card, i) => (
					<div key={i} className={`ad-kpi ad-kpi-${card.color}`}>
						<div className={`ad-kpi-icon ad-ki-${card.color}`}>{card.icon}</div>
						<div className="ad-kpi-body">
							<p className="ad-kpi-lbl">{card.label}</p>
							<p className="ad-kpi-val">{card.value}</p>
							{card.change !== null ? (
								<div className={`ad-kpi-chg ${card.change! >= 0 ? "ad-up" : "ad-dn"}`}>
									{card.change! >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
									<span>%{Math.abs(card.change!).toFixed(1)}</span>
								</div>
							) : (
								<p className="ad-kpi-desc">{card.desc}</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Charts */}
			<DashboardCharts
				appointmentsData={chartData.appt}
				revenueData={chartData.rev}
				statusData={chartData.status}
				serviceData={chartData.service}
			/>

			{/* Bottom */}
			<div className="ad-bottom">
				{/* Recent Visits */}
				<div className="ad-panel">
					<div className="ad-panel-hd">
						<h3 className="ad-panel-title"><Activity className="w-4 h-4" />Son Ziyaretler</h3>
						<a href="/admin/visits" className="ad-link">Tümünü Gör →</a>
					</div>
					<div className="ad-visits">
						{visits.length === 0 ? (
							<div className="ad-empty">Henüz ziyaret kaydı yok</div>
						) : visits.map((v: any) => (
							<div key={v.id} className="ad-visit-row">
								<div className="ad-visit-avatar"><PawPrint className="w-4 h-4" /></div>
								<div className="ad-visit-info">
									<p className="ad-visit-pet">{v.pet?.name || "—"}</p>
									<p className="ad-visit-meta">PRO-{v.protocolNumber} · {v.pet?.owner?.name || "—"}</p>
								</div>
								<div className="ad-visit-right">
									<p className="ad-visit-amt">{formatCurrency(v.totalAmount)}</p>
									<span className={`ad-badge ${statusConfig[v.status]?.cls || "s-pending"}`}>
										{statusConfig[v.status]?.label || v.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Sidebar panels */}
				<div className="ad-side">
					<div className="ad-panel">
						<div className="ad-panel-hd">
							<h3 className="ad-panel-title"><TrendingUp className="w-4 h-4" />Özet</h3>
						</div>
						<div className="ad-summary">
							{[
								{ dot: "dot-green", label: "Tahsil Edilen", val: formatCurrency(stats.totalRev), cls: "" },
								{ dot: "dot-amber", label: "Bekleyen Tahsilat", val: formatCurrency(stats.unpaidAmt), cls: "text-amber-600" },
								{ dot: "dot-red",   label: "Geçmiş Aşılar", val: `${stats.overdue} hasta`, cls: "text-red-500" },
								{ dot: "dot-blue",  label: "Aktif Hizmetler", val: `${stats.activeServices}`, cls: "" },
							].map((row, i) => (
								<div key={i} className="ad-sum-row">
									<div className="ad-sum-left"><span className={`ad-dot ${row.dot}`} />{row.label}</div>
									<span className={`ad-sum-val ${row.cls}`}>{row.val}</span>
								</div>
							))}
						</div>
					</div>

					<div className="ad-panel">
						<div className="ad-panel-hd">
							<h3 className="ad-panel-title"><Sparkles className="w-4 h-4" />Hızlı Erişim</h3>
						</div>
						<div className="ad-qactions">
							{[
								{ href: "/admin/visits",       icon: <FileText className="w-4 h-4" />, label: "Yeni Ziyaret" },
								{ href: "/admin/appointments", icon: <Calendar className="w-4 h-4" />, label: "Randevu" },
								{ href: "/admin/pets",         icon: <PawPrint className="w-4 h-4" />, label: "Hasta Ekle" },
								{ href: "/admin/vaccinations", icon: <Syringe  className="w-4 h-4" />, label: "Aşı Kaydı" },
							].map((btn, i) => (
								<a key={i} href={btn.href} className="ad-qbtn">{btn.icon}{btn.label}</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
