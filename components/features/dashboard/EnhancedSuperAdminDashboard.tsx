"use client"

import { useMemo } from "react"
import { useStats, useAppointments, usePets, useInvoices } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { format } from "date-fns"
import {
	Users, UserCheck, Shield, UserPlus,
	Calendar, PawPrint, DollarSign, FileText,
	ArrowUpRight, Activity, TrendingUp, Settings,
} from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { useVisits } from "@/lib/react-query/hooks/visits"

const roleCfg: Record<string, { label: string; cls: string }> = {
	SUPER_ADMIN: { label: "Süper Admin", cls: "rb-super" },
	ADMIN:       { label: "Admin",       cls: "rb-admin" },
	STAFF:       { label: "Personel",    cls: "rb-staff" },
	CUSTOMER:    { label: "Müşteri",     cls: "rb-customer" },
}

const visitStatusCfg: Record<string, { label: string; cls: string }> = {
	PENDING:     { label: "Bekliyor",      cls: "s-pending" },
	CONFIRMED:   { label: "Onaylandı",     cls: "s-confirmed" },
	COMPLETED:   { label: "Tamamlandı",    cls: "s-completed" },
	CANCELLED:   { label: "İptal",         cls: "s-cancelled" },
	IN_PROGRESS: { label: "Devam Ediyor",  cls: "s-inprogress" },
}

export function EnhancedSuperAdminDashboard() {
	const { formatCurrency } = useCurrency()
	const { data: usersResponse } = useStats()
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })
	const { data: visitsData } = useVisits({ limit: 8 })

	const users       = usersResponse?.users || []
	const appointments= appointmentsData?.appointments || []
	const pets        = petsData?.pets || []
	const invoices    = invoicesData?.invoices || []
	const visits      = visitsData?.visits || []

	const now            = new Date()
	const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const prevThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

	const userStats = useMemo(() => {
		const newUsers   = users.filter(u => new Date(u.createdAt || now) >= thirtyDaysAgo).length
		const prevUsers  = users.filter(u => new Date(u.createdAt || now) >= prevThirtyDays && new Date(u.createdAt || now) < thirtyDaysAgo).length
		const userChange = prevUsers > 0 ? ((newUsers - prevUsers) / prevUsers) * 100 : 0
		return {
			total:       users.length,
			customers:   users.filter(u => u.role === "CUSTOMER").length,
			admins:      users.filter(u => u.role === "ADMIN").length,
			superAdmins: users.filter(u => u.role === "SUPER_ADMIN").length,
			staff:       users.filter(u => u.role === "STAFF").length,
			newUsers, userChange,
		}
	}, [users, thirtyDaysAgo, prevThirtyDays])

	const bizStats = useMemo(() => {
		const paid       = invoices.filter(i => i.status === "PAID")
		const unpaid     = invoices.filter(i => i.status === "UNPAID")
		const monthRev   = invoices.filter(i => new Date(i.createdAt) >= thirtyDaysAgo && i.status === "PAID").reduce((s,i)=>s+i.amount, 0)
		const prevRev    = invoices.filter(i => new Date(i.createdAt) >= prevThirtyDays && new Date(i.createdAt) < thirtyDaysAgo && i.status === "PAID").reduce((s,i)=>s+i.amount, 0)
		const recentAppts = appointments.filter(a => new Date(a.date) >= thirtyDaysAgo).length
		return {
			totalRev:    paid.reduce((s,i)=>s+i.amount, 0),
			monthRev,
			revChange:   prevRev > 0 ? ((monthRev - prevRev) / prevRev) * 100 : 0,
			totalAppts:  appointments.length,
			recentAppts, totalPets: pets.length,
			totalInv:    invoices.length,
			paidCount:   paid.length,
			unpaidCount: unpaid.length,
			unpaidAmt:   unpaid.reduce((s,i)=>s+i.amount, 0),
		}
	}, [appointments, pets, invoices, thirtyDaysAgo, prevThirtyDays])

	const chartData = useMemo(() => {
		const apptChart = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(now); d.setDate(d.getDate() - (6 - i))
			return { name: format(d, "dd MMM"), value: appointments.filter(a => format(new Date(a.date),"yyyy-MM-dd")===format(d,"yyyy-MM-dd")).length }
		})
		const revChart = Array.from({ length: 6 }, (_, i) => {
			const d = new Date(now); d.setMonth(d.getMonth() - (5 - i))
			return { name: format(d, "MMM yy"), value: invoices.filter(inv => format(new Date(inv.createdAt),"yyyy-MM")===format(d,"yyyy-MM") && inv.status==="Ödendi").reduce((s,inv)=>s+inv.amount,0) }
		})
		const roleChart = [
			{ name: "Müşteri", value: userStats.customers },
			{ name: "Personel", value: userStats.staff },
			{ name: "Admin", value: userStats.admins },
			{ name: "Süper Admin", value: userStats.superAdmins },
		]
		return { appt: apptChart, rev: revChart, role: roleChart }
	}, [appointments, invoices, userStats])

	const recentUsers = useMemo(() =>
		[...users].sort((a,b) => new Date(b.createdAt||now).getTime() - new Date(a.createdAt||now).getTime()).slice(0, 6)
	, [users])

	return (
		<div className="ad-wrap">
			{/* Header */}
			<div className="ad-hd">
				<div>
					<h1 className="ad-hd-title">Süper Admin Paneli</h1>
					<p className="ad-hd-sub">{format(now, "d MMMM yyyy")} — Sistem Yönetimi</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<a href="/super/roles" className="sa-mgmt-btn">
						<Settings className="w-4 h-4" /> Kullanıcı Yönetimi
					</a>
					<span className="ad-live"><span className="ad-live-dot" />Canlı</span>
				</div>
			</div>

			{/* User KPI Row */}
			<div className="sa-user-grid">
				{[
					{ icon: <Users className="w-5 h-5" />,      color: "blue",   label: "Toplam Kullanıcı",   val: userStats.total,       sub: `${userStats.newUsers} bu ay yeni` },
					{ icon: <UserPlus className="w-5 h-5" />,   color: "teal",   label: "Müşteriler",         val: userStats.customers,   sub: "Müşteri hesabı" },
					{ icon: <Shield className="w-5 h-5" />,     color: "violet", label: "Adminler",           val: userStats.admins,      sub: "Admin hesabı" },
					{ icon: <UserCheck className="w-5 h-5" />,  color: "amber",  label: "Personel",           val: userStats.staff,       sub: "Personel hesabı" },
					{ icon: <Shield className="w-5 h-5" />,     color: "blue",   label: "Süper Adminler",     val: userStats.superAdmins, sub: "Tam yetki" },
				].map((c, i) => (
					<div key={i} className={`ad-kpi ad-kpi-${c.color}`} style={{ borderTop: "none", borderLeft: `3px solid var(--pc-${c.color === "blue" ? "blue" : c.color === "teal" ? "teal" : c.color === "violet" ? "violet" : "amber"})` }}>
						<div className={`ad-kpi-icon ad-ki-${c.color}`}>{c.icon}</div>
						<div className="ad-kpi-body">
							<p className="ad-kpi-lbl">{c.label}</p>
							<p className="ad-kpi-val">{c.val}</p>
							<p className="ad-kpi-desc">{c.sub}</p>
						</div>
					</div>
				))}
			</div>

			{/* Business KPI Row */}
			<div className="ad-kpi-grid">
				{[
					{ icon: <DollarSign className="w-5 h-5" />, color: "blue",   label: "Toplam Gelir",       val: formatCurrency(bizStats.totalRev),   sub: `${formatCurrency(bizStats.monthRev)} bu ay`, change: bizStats.revChange },
					{ icon: <Calendar className="w-5 h-5" />,   color: "teal",   label: "Toplam Randevu",     val: bizStats.totalAppts,                 sub: `${bizStats.recentAppts} son 30 günde`, change: null },
					{ icon: <PawPrint className="w-5 h-5" />,   color: "violet", label: "Toplam Hasta",       val: bizStats.totalPets,                  sub: "Kayıtlı hayvan", change: null },
					{ icon: <FileText className="w-5 h-5" />,   color: "amber",  label: "Toplam Fatura",      val: bizStats.totalInv,                   sub: `${bizStats.paidCount} ödendi, ${bizStats.unpaidCount} bekliyor`, change: null },
				].map((c, i) => (
					<div key={i} className={`ad-kpi ad-kpi-${c.color}`}>
						<div className={`ad-kpi-icon ad-ki-${c.color}`}>{c.icon}</div>
						<div className="ad-kpi-body">
							<p className="ad-kpi-lbl">{c.label}</p>
							<p className="ad-kpi-val">{c.val}</p>
							{c.change !== null ? (
								<div className={`ad-kpi-chg ${c.change! >= 0 ? "ad-up" : "ad-dn"}`}>
									<ArrowUpRight className="w-3 h-3" />
									<span>%{Math.abs(c.change!).toFixed(1)} geçen aya göre</span>
								</div>
							) : (
								<p className="ad-kpi-desc">{c.sub}</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Charts */}
			<DashboardCharts
				appointmentsData={chartData.appt}
				revenueData={chartData.rev}
				statusData={chartData.role}
			/>

			{/* Bottom */}
			<div className="ad-bottom">
				{/* Recent Users */}
				<div className="ad-panel">
					<div className="ad-panel-hd">
						<h3 className="ad-panel-title"><Activity className="w-4 h-4" />Son Kayıt Olan Kullanıcılar</h3>
						<a href="/super/roles" className="ad-link">Tümünü Yönet →</a>
					</div>
					<div className="ad-visits">
						{recentUsers.length === 0 ? (
							<div className="ad-empty">Henüz kullanıcı yok</div>
						) : recentUsers.map((u: any) => (
							<div key={u.id} className="ad-visit-row">
								<div className="ad-visit-avatar" style={{ background: "var(--pc-violet-lt)", color: "var(--pc-violet)" }}>
									{(u.name || u.email || "U").charAt(0).toUpperCase()}
								</div>
								<div className="ad-visit-info">
									<p className="ad-visit-pet">{u.name || "—"}</p>
									<p className="ad-visit-meta">{u.email}</p>
								</div>
								<div className="ad-visit-right">
									<span className={`ad-badge ${roleCfg[u.role]?.cls || "rb-customer"}`}>
										{roleCfg[u.role]?.label || u.role}
									</span>
									{u.createdAt && <p className="ad-visit-meta">{format(new Date(u.createdAt), "d MMM yyyy")}</p>}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Side */}
				<div className="ad-side">
					<div className="ad-panel">
						<div className="ad-panel-hd">
							<h3 className="ad-panel-title"><TrendingUp className="w-4 h-4" />Sistem Özeti</h3>
						</div>
						<div className="ad-summary">
							{[
								{ dot: "dot-blue",  label: "Toplam Kullanıcı",    val: `${userStats.total}` },
								{ dot: "dot-green", label: "Tahsil Edilen Gelir",  val: formatCurrency(bizStats.totalRev) },
								{ dot: "dot-amber", label: "Bekleyen Tahsilat",    val: formatCurrency(bizStats.unpaidAmt), cls: "text-amber-600" },
								{ dot: "dot-violet",label: "Toplam Hasta",         val: `${bizStats.totalPets}` },
							].map((row, i) => (
								<div key={i} className="ad-sum-row">
									<div className="ad-sum-left"><span className={`ad-dot ${row.dot}`} />{row.label}</div>
									<span className={`ad-sum-val ${row.cls || ""}`}>{row.val}</span>
								</div>
							))}
						</div>
					</div>

					<div className="ad-panel">
						<div className="ad-panel-hd">
							<h3 className="ad-panel-title"><Users className="w-4 h-4" />Kullanıcı Dağılımı</h3>
						</div>
						<div className="sa-role-dist">
							{[
								{ label: "Müşteri",      val: userStats.customers,   pct: userStats.total > 0 ? (userStats.customers / userStats.total) * 100 : 0,   color: "#3B82F6" },
								{ label: "Personel",     val: userStats.staff,       pct: userStats.total > 0 ? (userStats.staff / userStats.total) * 100 : 0,       color: "#0D9488" },
								{ label: "Admin",        val: userStats.admins,      pct: userStats.total > 0 ? (userStats.admins / userStats.total) * 100 : 0,      color: "#7C3AED" },
								{ label: "Süper Admin",  val: userStats.superAdmins, pct: userStats.total > 0 ? (userStats.superAdmins / userStats.total) * 100 : 0, color: "#D97706" },
							].map((row, i) => (
								<div key={i} className="sa-role-row">
									<div className="sa-role-info">
										<span style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, display: "inline-block", marginRight: 8, flexShrink: 0 }} />
										<span className="sa-role-label">{row.label}</span>
										<span className="sa-role-count">{row.val}</span>
									</div>
									<div className="sa-role-bar-wrap">
										<div className="sa-role-bar" style={{ width: `${row.pct}%`, background: row.color }} />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
