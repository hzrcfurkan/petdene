"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { useStats, useAppointments, usePets, useInvoices } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { format, isSameDay, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"
import { tr } from "date-fns/locale"
import {
	Users, UserCheck, Shield, UserPlus,
	Calendar, PawPrint, DollarSign, FileText,
	ArrowUpRight, Activity, TrendingUp, Settings,
	ChevronLeft, ChevronRight, X, Syringe,
} from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"

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

function MiniCalendar({ selected, onChange, onClose }: {
	selected: Date | null
	onChange: (d: Date | null) => void
	onClose: () => void
}) {
	const today = new Date()
	const [viewMonth, setViewMonth] = useState(selected || today)
	const year  = viewMonth.getFullYear()
	const month = viewMonth.getMonth()
	const firstDay = new Date(year, month, 1).getDay() // 0=Sun
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const days: (Date | null)[] = []
	// Start week on Monday
	const startOffset = (firstDay + 6) % 7
	for (let i = 0; i < startOffset; i++) days.push(null)
	for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

	const prevMonth = () => setViewMonth(new Date(year, month - 1, 1))
	const nextMonth = () => setViewMonth(new Date(year, month + 1, 1))

	return (
		<div className="sa-cal-popup">
			<div className="sa-cal-header">
				<button className="sa-cal-nav" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></button>
				<span className="sa-cal-title">{format(viewMonth, "MMMM yyyy", { locale: tr })}</span>
				<button className="sa-cal-nav" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></button>
			</div>
			<div className="sa-cal-grid">
				{["Pt","Sa","Ça","Pe","Cu","Ct","Pz"].map(d => (
					<div key={d} className="sa-cal-dow">{d}</div>
				))}
				{days.map((d, i) => {
					if (!d) return <div key={`e-${i}`} />
					const isToday    = isSameDay(d, today)
					const isSel      = selected && isSameDay(d, selected)
					return (
						<button
							key={d.toISOString()}
							className={`sa-cal-day${isToday ? " sa-cal-today" : ""}${isSel ? " sa-cal-sel" : ""}`}
							onClick={() => { onChange(isSel ? null : d); onClose() }}
						>
							{d.getDate()}
						</button>
					)
				})}
			</div>
			{selected && (
				<div className="sa-cal-footer">
					<button className="sa-cal-clear" onClick={() => { onChange(null); onClose() }}>
						<X className="w-3 h-3" /> Filtreyi Kaldır
					</button>
				</div>
			)}
		</div>
	)
}

export function EnhancedSuperAdminDashboard() {
	const { formatCurrency } = useCurrency()
	const { data: usersResponse } = useStats()
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })
	const { data: visitsData } = useVisits({ limit: 1000 })
	const { data: vaccinationsData } = useVaccinations({ limit: 1000 })

	const users        = usersResponse?.users || []
	const appointments = appointmentsData?.appointments || []
	const pets         = petsData?.pets || []
	const invoices     = invoicesData?.invoices || []
	const visits       = visitsData?.visits || []
	const vaccinations = vaccinationsData?.vaccinations || []

	// ---- Takvim state ----
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [calOpen, setCalOpen] = useState(false)
	const calRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false)
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [])

	const now = new Date()

	// Seçili tarihe göre filtre aralığı
	const filterStart = selectedDate ? startOfDay(selectedDate) : null
	const filterEnd   = selectedDate ? endOfDay(selectedDate)   : null
	const isFiltered  = !!selectedDate

	// Filtrelenmiş veri setleri
	const filteredAppointments = useMemo(() =>
		isFiltered
			? appointments.filter(a => {
				const d = new Date(a.date)
				return d >= filterStart! && d <= filterEnd!
			})
			: appointments
	, [appointments, isFiltered, filterStart, filterEnd])

	const filteredInvoices = useMemo(() =>
		isFiltered
			? invoices.filter(i => {
				const d = new Date(i.createdAt)
				return d >= filterStart! && d <= filterEnd!
			})
			: invoices
	, [invoices, isFiltered, filterStart, filterEnd])

	const filteredVisits = useMemo(() =>
		isFiltered
			? visits.filter(v => {
				const d = new Date(v.visitDate || v.createdAt)
				return d >= filterStart! && d <= filterEnd!
			})
			: visits
	, [visits, isFiltered, filterStart, filterEnd])

	const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const prevThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

	const userStats = useMemo(() => {
		const newUsers  = users.filter(u => new Date(u.createdAt || now) >= thirtyDaysAgo).length
		const prevUsers = users.filter(u => new Date(u.createdAt || now) >= prevThirtyDays && new Date(u.createdAt || now) < thirtyDaysAgo).length
		return {
			total:       users.length,
			customers:   users.filter(u => u.role === "CUSTOMER").length,
			admins:      users.filter(u => u.role === "ADMIN").length,
			superAdmins: users.filter(u => u.role === "SUPER_ADMIN").length,
			staff:       users.filter(u => u.role === "STAFF").length,
			newUsers,
			userChange: prevUsers > 0 ? ((newUsers - prevUsers) / prevUsers) * 100 : 0,
		}
	}, [users, thirtyDaysAgo, prevThirtyDays])

	const bizStats = useMemo(() => {
		const paid    = filteredInvoices.filter(i => i.status === "PAID")
		const unpaid  = filteredInvoices.filter(i => i.status === "UNPAID")
		const allPaid = invoices.filter(i => i.status === "PAID")

		const monthRev  = invoices.filter(i => new Date(i.createdAt) >= thirtyDaysAgo && i.status === "PAID").reduce((s,i)=>s+i.amount,0)
		const prevRev   = invoices.filter(i => new Date(i.createdAt) >= prevThirtyDays && new Date(i.createdAt) < thirtyDaysAgo && i.status === "PAID").reduce((s,i)=>s+i.amount,0)
		const recentAppts = filteredAppointments.length

		return {
			totalRev:    paid.reduce((s,i)=>s+i.amount,0),
			allTimeRev:  allPaid.reduce((s,i)=>s+i.amount,0),
			monthRev,
			revChange:   prevRev > 0 ? ((monthRev - prevRev) / prevRev) * 100 : 0,
			totalAppts:  filteredAppointments.length,
			recentAppts,
			totalPets:   pets.length,
			totalInv:    filteredInvoices.length,
			paidCount:   paid.length,
			unpaidCount: unpaid.length,
			unpaidAmt:   unpaid.reduce((s,i)=>s+i.amount,0),
		}
	}, [filteredAppointments, filteredInvoices, pets, invoices, thirtyDaysAgo, prevThirtyDays])

	const todayStats = useMemo(() => {
		const todayStr = format(now, "yyyy-MM-dd")
		const todayStart = new Date(todayStr + "T00:00:00.000Z")
		const todayEnd   = new Date(todayStr + "T23:59:59.999Z")

		// Bugünkü randevular
		const todayAppts = appointments.filter(a =>
			format(new Date(a.date), "yyyy-MM-dd") === todayStr
		)
		const completedAppts = todayAppts.filter(a => a.status === "COMPLETED").length
		const pendingAppts   = todayAppts.filter(a => ["PENDING","CONFIRMED"].includes(a.status)).length

		// Bugün gelen hasta (visit)
		const todayVisits = visits.filter(v =>
			format(new Date(v.visitDate || v.createdAt), "yyyy-MM-dd") === todayStr
		)
		const activeVisits = todayVisits.filter(v => v.status === "IN_PROGRESS").length

		// Bugün yapılacak aşılar (nextDue = bugün)
		const todayVaccinations = vaccinations.filter(v =>
			v.nextDue && format(new Date(v.nextDue), "yyyy-MM-dd") === todayStr
		)

		// Bugünkü ciro (ödenen visit payments)
		const todayCiro = visits
			.filter(v => format(new Date(v.visitDate || v.createdAt), "yyyy-MM-dd") === todayStr)
			.reduce((s, v) => s + (v.paidAmount || 0), 0)

		// Bugünkü tahsilat (bugün ödenen invoice'lar)
		const todayTahsilat = invoices
			.filter(i => i.status === "PAID" && format(new Date(i.updatedAt || i.createdAt), "yyyy-MM-dd") === todayStr)
			.reduce((s, i) => s + i.amount, 0)

		return {
			todayAppts:        todayAppts.length,
			completedAppts,
			pendingAppts,
			todayVisits:       todayVisits.length,
			activeVisits,
			todayVaccinations: todayVaccinations.length,
			todayCiro,
			todayTahsilat,
		}
	}, [appointments, visits, vaccinations, invoices])

	const chartData = useMemo(() => {
		const apptChart = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(now); d.setDate(d.getDate() - (6 - i))
			return { name: format(d, "dd MMM"), value: filteredAppointments.filter(a => format(new Date(a.date),"yyyy-MM-dd")===format(d,"yyyy-MM-dd")).length }
		})
		const revChart = Array.from({ length: 6 }, (_, i) => {
			const d = new Date(now); d.setMonth(d.getMonth() - (5 - i))
			return { name: format(d, "MMM yy"), value: filteredInvoices.filter(inv => format(new Date(inv.createdAt),"yyyy-MM")===format(d,"yyyy-MM") && inv.status==="PAID").reduce((s,inv)=>s+inv.amount,0) }
		})
		const roleChart = [
			{ name: "Müşteri",    value: userStats.customers },
			{ name: "Personel",   value: userStats.staff },
			{ name: "Admin",      value: userStats.admins },
			{ name: "Süper Admin",value: userStats.superAdmins },
		]
		// Bu aydaki günlere göre randevu dağılımı (pasta grafik için)
		const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
		const monthlyApptChart = Array.from({ length: daysInMonth }, (_, i) => {
			const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
			const count = filteredAppointments.filter(a => format(new Date(a.date),"yyyy-MM-dd")===format(d,"yyyy-MM-dd")).length
			return { name: format(d, "d MMM"), value: count }
		}).filter(d => d.value > 0)
		return { appt: apptChart, rev: revChart, role: roleChart, monthlyAppt: monthlyApptChart }
	}, [filteredAppointments, filteredInvoices, userStats])

	const recentUsers = useMemo(() =>
		[...users].sort((a,b) => new Date(b.createdAt||now).getTime() - new Date(a.createdAt||now).getTime()).slice(0, 6)
	, [users])

	const dateLabel = selectedDate
		? format(selectedDate, "d MMMM yyyy", { locale: tr })
		: format(now, "d MMMM yyyy", { locale: tr })

	return (
		<div className="ad-wrap">
			{/* Header */}
			<div className="ad-hd">
				<div>
					<h1 className="ad-hd-title">Süper Admin Paneli</h1>
					<p className="ad-hd-sub">
						{isFiltered
							? <><span className="sa-date-badge"><Calendar className="w-3 h-3" />{dateLabel} — Tarih Filtresi Aktif</span></>
							: <>{dateLabel} — Sistem Yönetimi</>
						}
					</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					{/* Takvim butonu */}
					<div ref={calRef} style={{ position: "relative" }}>
						<button
							className={`sa-cal-btn${isFiltered ? " sa-cal-btn-active" : ""}`}
							onClick={() => setCalOpen(v => !v)}
						>
							<Calendar className="w-4 h-4" />
							<span>Tarih: {isFiltered ? dateLabel : "Tümü"}</span>
							{isFiltered && (
								<span
									className="sa-cal-x"
									onClick={(e) => { e.stopPropagation(); setSelectedDate(null) }}
								>
									<X className="w-3 h-3" />
								</span>
							)}
						</button>
						{calOpen && (
							<MiniCalendar
								selected={selectedDate}
								onChange={setSelectedDate}
								onClose={() => setCalOpen(false)}
							/>
						)}
					</div>
					<a href="/super/roles" className="sa-mgmt-btn">
						<Settings className="w-4 h-4" /> Kullanıcı Yönetimi
					</a>
					<span className="ad-live"><span className="ad-live-dot" />Canlı</span>
				</div>
			</div>

			{/* Bugün KPI Row */}
			<div className="sa-user-grid">
				{/* Bugünkü Randevular */}
				<div className="ad-kpi ad-kpi-blue sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-blue"><Calendar className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugünkü Randevular</p>
						<p className="ad-kpi-val">{todayStats.todayAppts}</p>
						<div className="sa-today-sub">
							<span className="sa-today-chip sa-chip-green">{todayStats.completedAppts} tamamlandı</span>
							<span className="sa-today-chip sa-chip-amber">{todayStats.pendingAppts} bekliyor</span>
						</div>
					</div>
				</div>

				{/* Bugün Gelen Hasta */}
				<div className="ad-kpi ad-kpi-teal sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-teal"><PawPrint className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugün Gelen Hasta</p>
						<p className="ad-kpi-val">{todayStats.todayVisits}</p>
						<div className="sa-today-sub">
							{todayStats.activeVisits > 0
								? <span className="sa-today-chip sa-chip-blue">{todayStats.activeVisits} aktif</span>
								: <span className="sa-today-chip sa-chip-gray">aktif ziyaret yok</span>
							}
						</div>
					</div>
				</div>

				{/* Bugün Yapılacak Aşılar */}
				<div className="ad-kpi ad-kpi-violet sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-violet"><Syringe className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugün Yapılacak Aşılar</p>
						<p className="ad-kpi-val">{todayStats.todayVaccinations}</p>
						<div className="sa-today-sub">
							{todayStats.todayVaccinations > 0
								? <span className="sa-today-chip sa-chip-violet">hatırlatma var</span>
								: <span className="sa-today-chip sa-chip-gray">aşı yok</span>
							}
						</div>
					</div>
				</div>

				{/* Bugünkü Ciro */}
				<div className="ad-kpi ad-kpi-amber sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-amber"><DollarSign className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugünkü Ciro</p>
						<p className="ad-kpi-val">{formatCurrency(todayStats.todayCiro)}</p>
						<p className="ad-kpi-desc">bugün tahsil edildi</p>
					</div>
				</div>

				{/* Bugünkü Tahsilat */}
				<div className="ad-kpi ad-kpi-teal sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-teal"><TrendingUp className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugünkü Tahsilat</p>
						<p className="ad-kpi-val">{formatCurrency(todayStats.todayTahsilat)}</p>
						<p className="ad-kpi-desc">bugün ödenen faturalar</p>
					</div>
				</div>
			</div>

			{/* Business KPI Row */}
			<div className="ad-kpi-grid">
				{[
					{ icon: <DollarSign className="w-5 h-5" />, color: "blue",   label: isFiltered ? "Günlük Gelir" : "Toplam Gelir",    val: formatCurrency(bizStats.totalRev),  sub: isFiltered ? dateLabel : `${formatCurrency(bizStats.monthRev)} bu ay`, change: isFiltered ? null : bizStats.revChange },
					{ icon: <Calendar className="w-5 h-5" />,   color: "teal",   label: isFiltered ? "Günlük Randevu" : "Toplam Randevu", val: bizStats.totalAppts,                sub: isFiltered ? `${dateLabel} randevuları` : `${bizStats.recentAppts} son 30 günde`, change: null },
					{ icon: <PawPrint className="w-5 h-5" />,   color: "violet", label: "Toplam Hasta",      val: bizStats.totalPets,                 sub: "Kayıtlı hayvan", change: null },
					{ icon: <FileText className="w-5 h-5" />,   color: "amber",  label: isFiltered ? "Günlük Fatura" : "Toplam Fatura",  val: bizStats.totalInv,                  sub: `${bizStats.paidCount} ödendi, ${bizStats.unpaidCount} bekliyor`, change: null },
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

			{/* Sistem Ozeti - 4 renk kartı */}
			<div className="sa-ozet-row">
				<div className="sa-ozet-label">
					<TrendingUp className="w-4 h-4" />
					<span>Sistem Özeti</span>
				</div>
				<div className="sa-ozet-cards">
					{[
						{ icon: <Users className="w-4 h-4" />,      color: "blue",   label: "Toplam Kullanıcı",   val: `${userStats.total}`,                         sub: `${userStats.newUsers} bu ay` },
						{ icon: <DollarSign className="w-4 h-4" />, color: "teal",   label: "Tahsil Edilen Gelir",val: formatCurrency(bizStats.allTimeRev),            sub: "tüm zamanlar" },
						{ icon: <FileText className="w-4 h-4" />,   color: "amber",  label: "Bekleyen Tahsilat",  val: formatCurrency(bizStats.unpaidAmt),             sub: `${bizStats.unpaidCount} fatura`, warn: bizStats.unpaidAmt > 0 },
						{ icon: <PawPrint className="w-4 h-4" />,   color: "violet", label: "Toplam Hasta",       val: `${bizStats.totalPets}`,                        sub: "kayıtlı hayvan" },
					].map((row, i) => (
						<div key={i} className={`sa-ozet-card sa-ozet-${row.color}${row.warn ? " sa-ozet-warn" : ""}`}>
							<div className={`sa-ozet-icon sa-oi-${row.color}`}>{row.icon}</div>
							<div className="sa-ozet-body">
								<p className="sa-ozet-lbl">{row.label}</p>
								<p className={`sa-ozet-val${row.warn ? " sa-ozet-val-warn" : ""}`}>{row.val}</p>
								<p className="sa-ozet-sub">{row.sub}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Charts */}
			<DashboardCharts
				appointmentsData={chartData.appt}
				revenueData={chartData.rev}
				statusData={chartData.role}
				monthlyApptData={chartData.monthlyAppt}
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
			</div>
		</div>
	)
}
