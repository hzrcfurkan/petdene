"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { useStats } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { format, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import {
	Users, UserCheck, Shield, UserPlus,
	Calendar, PawPrint, DollarSign, FileText,
	ArrowUpRight, Activity, TrendingUp, Settings,
	ChevronLeft, ChevronRight, X, Eye, Phone, Mail,
	AlertTriangle, AlertCircle, Clock, Receipt, Pill, Package, CheckCircle2, XCircle, RotateCcw,
} from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"


const WA_MSG = encodeURIComponent("Merhaba, sizlere ABC Veteriner kliniğinden ulaşmaktayım.")

function waLink(phone: string | null | undefined): string | null {
	if (!phone) return null
	// Sadece rakamları al, başındaki 0 veya +90 varsa temizle
	const digits = phone.replace(/\D/g, "").replace(/^0/, "").replace(/^90/, "")
	return `https://wa.me/90${digits}?text=${WA_MSG}`
}

const roleCfg: Record<string, { label: string; cls: string }> = {
	SUPER_ADMIN: { label: "Süper Admin", cls: "rb-super" },
	ADMIN:       { label: "Admin",       cls: "rb-admin" },
	STAFF:       { label: "Personel",    cls: "rb-staff" },
	CUSTOMER:    { label: "Müşteri",     cls: "rb-customer" },
}

// ---- MINI CALENDAR ----
function MiniCalendar({ selected, onChange, onClose }: {
	selected: Date | null
	onChange: (d: Date | null) => void
	onClose: () => void
}) {
	const today = new Date()
	const [viewMonth, setViewMonth] = useState(selected || today)
	const year  = viewMonth.getFullYear()
	const month = viewMonth.getMonth()
	const firstDay = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const days: (Date | null)[] = []
	const startOffset = (firstDay + 6) % 7
	for (let i = 0; i < startOffset; i++) days.push(null)
	for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

	return (
		<div className="sa-cal-popup">
			<div className="sa-cal-header">
				<button className="sa-cal-nav" onClick={() => setViewMonth(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></button>
				<span className="sa-cal-title">{format(viewMonth, "MMMM yyyy", { locale: tr })}</span>
				<button className="sa-cal-nav" onClick={() => setViewMonth(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></button>
			</div>
			<div className="sa-cal-grid">
				{["Pt","Sa","Ça","Pe","Cu","Ct","Pz"].map(d => <div key={d} className="sa-cal-dow">{d}</div>)}
				{days.map((d, i) => {
					if (!d) return <div key={`e-${i}`} />
					const isToday = isSameDay(d, today)
					const isSel   = selected && isSameDay(d, selected)
					return (
						<button key={d.toISOString()} className={`sa-cal-day${isToday ? " sa-cal-today" : ""}${isSel ? " sa-cal-sel" : ""}`}
							onClick={() => { onChange(isSel ? null : d); onClose() }}>
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

// ---- DETAIL POPUP ----
type PopupType = "appointments" | "visits" | "vaccinations" | "ciro" | "tahsilat" | null

function DetailPopup({ type, data, dateLabel, onClose, formatCurrency }: {
	type: PopupType
	data: any
	dateLabel: string
	onClose: () => void
	formatCurrency: (n: number) => string
}) {
	if (!type) return null

	const titles: Record<string, string> = {
		appointments:  "Bugünkü Randevular",
		visits:        "Bugün Gelen Hastalar",
		vaccinations:  "Bugün Yapılacak Aşılar",
		ciro:          "Bugünkü Ciro Detayı",
		tahsilat:      "Bugünkü Tahsilat Detayı",
	}

	const statusLabel: Record<string, { label: string; cls: string }> = {
		PENDING:     { label: "Bekliyor",     cls: "s-pending" },
		CONFIRMED:   { label: "Onaylandı",    cls: "s-confirmed" },
		COMPLETED:   { label: "Tamamlandı",   cls: "s-completed" },
		CANCELLED:   { label: "İptal",        cls: "s-cancelled" },
		IN_PROGRESS: { label: "Devam Ediyor", cls: "s-inprogress" },
	}

	return (
		<div className="sa-popup-overlay" onClick={onClose}>
			<div className="sa-popup" onClick={e => e.stopPropagation()}>
				{/* Header */}
				<div className="sa-popup-hd">
					<div>
						<h2 className="sa-popup-title">{titles[type]}</h2>
						<p className="sa-popup-sub">{dateLabel}</p>
					</div>
					<button className="sa-popup-close" onClick={onClose}><X className="w-5 h-5" /></button>
				</div>

				{/* Content */}
				<div className="sa-popup-body">

					{/* RANDEVULAR */}
					{type === "appointments" && (
						data.length === 0
							? <div className="sa-popup-empty">Bu gün randevu bulunmuyor.</div>
							: <table className="sa-popup-table">
								<thead><tr>
									<th>Hasta</th><th>Tür</th><th>Sahip</th><th>Telefon</th><th>Hizmet</th><th>Saat</th><th>Durum</th>
								</tr></thead>
								<tbody>
									{data.map((a: any) => (
										<tr key={a.id}>
											<td><span className="sa-pt-name">{a.pet?.name || "—"}</span></td>
											<td>{a.pet?.species || "—"}</td>
											<td>{a.pet?.owner?.name || a.pet?.owner?.email || "—"}</td>
											<td>
												{waLink(a.pet?.owner?.phone)
													? <a href={waLink(a.pet?.owner?.phone)!} target="_blank" rel="noopener noreferrer" className="sa-pt-phone sa-pt-wa"><Phone className="w-3 h-3" />{a.pet?.owner?.phone}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
											<td>{a.service?.title || "—"}</td>
											<td>{format(new Date(a.date), "HH:mm")}</td>
											<td><span className={`ad-badge ${statusLabel[a.status]?.cls || ""}`}>{statusLabel[a.status]?.label || a.status}</span></td>
										</tr>
									))}
								</tbody>
							</table>
					)}

					{/* HASTALAR (ZİYARETLER) */}
					{type === "visits" && (
						data.length === 0
							? <div className="sa-popup-empty">Bu gün ziyaret bulunmuyor.</div>
							: <table className="sa-popup-table">
								<thead><tr>
									<th>Protokol</th><th>Hasta</th><th>Tür</th><th>Sahip</th><th>Telefon</th><th>Toplam</th><th>Ödenen</th><th>Durum</th>
								</tr></thead>
								<tbody>
									{data.map((v: any) => (
										<tr key={v.id}>
											<td><span className="sa-pt-protocol">PRO-{v.protocolNumber}</span></td>
											<td><span className="sa-pt-name">{v.pet?.name || "—"}</span></td>
											<td>{v.pet?.species || "—"}</td>
											<td>{v.pet?.owner?.name || v.pet?.owner?.email || "—"}</td>
											<td>
												{waLink(v.pet?.owner?.phone)
													? <a href={waLink(v.pet?.owner?.phone)!} target="_blank" rel="noopener noreferrer" className="sa-pt-phone sa-pt-wa"><Phone className="w-3 h-3" />{v.pet?.owner?.phone}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
											<td>{formatCurrency(v.totalAmount || 0)}</td>
											<td>{formatCurrency(v.paidAmount || 0)}</td>
											<td><span className={`ad-badge ${statusLabel[v.status]?.cls || ""}`}>{statusLabel[v.status]?.label || v.status}</span></td>
										</tr>
									))}
								</tbody>
							</table>
					)}

					{/* AŞILAR */}
					{type === "vaccinations" && (
						data.length === 0
							? <div className="sa-popup-empty">Bu gün yapılacak aşı bulunmuyor.</div>
							: <table className="sa-popup-table">
								<thead><tr>
									<th>Aşı</th><th>Hasta</th><th>Sahip</th><th>Saat</th><th>Durum</th><th>Telefon</th>
								</tr></thead>
								<tbody>
									{data.map((v: any) => (
										<tr key={v.id}>
											<td><span className="sa-pt-name">{v.vaccineName}</span><div style={{fontSize:11,color:"#888"}}>{v.pet?.species}</div></td>
											<td>{v.pet?.name || "—"}</td>
											<td>{v.pet?.owner?.name || "—"}</td>
											<td><strong>{v.scheduledTime || "—"}</strong></td>
											<td>
												{v.isPlanned
													? <span style={{background:"#dbeafe",color:"#1d4ed8",borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:600}}>PLANLI</span>
													: <span style={{background:"#dcfce7",color:"#15803d",borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:600}}>HATIRLATMA</span>}
											</td>
											<td>
												{waLink(v.pet?.owner?.phone)
													? <a href={waLink(v.pet?.owner?.phone)!} target="_blank" rel="noopener noreferrer" className="sa-pt-phone sa-pt-wa"><Phone className="w-3 h-3" />{v.pet?.owner?.phone}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
										</tr>
									))}
								</tbody>
							</table>
					)}

					{/* CİRO */}
					{type === "ciro" && (
						data.length === 0
							? <div className="sa-popup-empty">Bu gün oluşturulan ziyaret bulunmuyor.</div>
							: <table className="sa-popup-table">
								<thead><tr>
									<th>Protokol</th><th>Hasta</th><th>Sahip</th><th>Telefon</th><th>Hizmetler</th><th>Toplam</th><th>Ödenen</th><th>Bakiye</th>
								</tr></thead>
								<tbody>
									{data.map((v: any) => (
										<tr key={v.id}>
											<td><span className="sa-pt-protocol">PRO-{v.protocolNumber}</span></td>
											<td><span className="sa-pt-name">{v.pet?.name || "—"}</span></td>
											<td>{v.pet?.owner?.name || "—"}</td>
											<td>
												{waLink(v.pet?.owner?.phone)
													? <a href={waLink(v.pet?.owner?.phone)!} target="_blank" rel="noopener noreferrer" className="sa-pt-phone sa-pt-wa"><Phone className="w-3 h-3" />{v.pet?.owner?.phone}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
											<td>{v._count?.services ?? "—"} hizmet</td>
											<td><strong>{formatCurrency(v.totalAmount || 0)}</strong></td>
											<td>{formatCurrency(v.paidAmount || 0)}</td>
											<td>
												{(v.totalAmount - v.paidAmount) > 0
													? <span style={{ color: "var(--pc-red)", fontWeight: 600 }}>{formatCurrency(v.totalAmount - v.paidAmount)}</span>
													: <span style={{ color: "var(--pc-green)", fontWeight: 600 }}>Ödendi</span>}
											</td>
										</tr>
									))}
								</tbody>
							</table>
					)}

					{/* TAHSİLAT */}
					{type === "tahsilat" && (
						data.length === 0
							? <div className="sa-popup-empty">Bu gün tahsilat bulunmuyor.</div>
							: <table className="sa-popup-table">
								<thead><tr>
									<th>Protokol</th><th>Hasta</th><th>Sahip</th><th>Telefon</th><th>Yöntem</th><th>Tahsilat</th><th>Saat</th>
								</tr></thead>
								<tbody>
									{data.map((row: any, i: number) => (
										<tr key={i}>
											<td><span className="sa-pt-protocol">PRO-{row.protocolNumber}</span></td>
											<td><span className="sa-pt-name">{row.petName || "—"}</span></td>
											<td>{row.ownerName || "—"}</td>
											<td>
												{waLink(row.ownerPhone)
													? <a href={waLink(row.ownerPhone)!} target="_blank" rel="noopener noreferrer" className="sa-pt-phone sa-pt-wa"><Phone className="w-3 h-3" />{row.ownerPhone}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
											<td>{row.method === "cash" ? "Nakit" : row.method === "card" ? "Kart" : row.method}</td>
											<td><strong>{formatCurrency(row.amount)}</strong></td>
											<td>{row.paidAt ? format(new Date(row.paidAt), "HH:mm") : "—"}</td>
										</tr>
									))}
								</tbody>
							</table>
					)}

				</div>
			</div>
		</div>
	)
}

// ---- MAIN DASHBOARD ----
export function EnhancedSuperAdminDashboard() {
	const { formatCurrency } = useCurrency()
	const { data: usersResponse } = useStats()
	const users = usersResponse?.users || []

	// ---- State ----
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [calOpen, setCalOpen]           = useState(false)
	const [popup, setPopup]               = useState<PopupType>(null)
	const calRef = useRef<HTMLDivElement>(null)
	const now = new Date()

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false)
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [])

	// ---- Dashboard API (limit yok, server'da hesaplanıyor) ----
	const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(now, "yyyy-MM-dd")
	const { data: dashData } = useQuery({
		queryKey: ["dashboard-stats", dateKey],
		queryFn: async () => {
			const res = await fetch(`/api/v1/dashboard?date=${dateKey}`)
			if (!res.ok) throw new Error("Dashboard API hatası")
			return res.json()
		},
		staleTime: 30_000,
		refetchInterval: 60_000,
	})

	const todayD   = dashData?.today
	const monthD   = dashData?.month
	const generalD = dashData?.general

	const isFiltered = !!selectedDate

	const userStats = useMemo(() => {
		const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
		const prevThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
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
	}, [users])

	const bizStats = useMemo(() => {
		// Klinik Nabzı - server'dan hesaplanmış veriler
		return {
			monthRev:       monthD?.ciro?.amount ?? 0,
			revChange:      monthD?.ciro?.change ?? 0,
			prevRev:        0, // kıyas API'de hesaplanıyor, burada sadece change % kullanılıyor
			doluluk:        monthD?.doluluk?.percent ?? 0,
			dolulukChange:  0,
			completedMonth: monthD?.doluluk?.completed ?? 0,
			monthAppts:     monthD?.doluluk?.total ?? 0,
			newPetsMonth:   monthD?.newPets ?? 0,
			newPetsChange:  0,
			unpaidAmt:      monthD?.unpaid?.amount ?? 0,
			unpaidCount:    monthD?.unpaid?.count ?? 0,
			allTimeRev:     generalD?.allTimeRevenue ?? 0,
			totalPets:      generalD?.totalPets ?? 0,
		}
	}, [monthD, generalD])

	const todayStats = useMemo(() => {
		if (!todayD) return {
			todayAppts: 0, completedAppts: 0, pendingAppts: 0,
			todayVisits: 0, activeVisits: 0, todayVaccinations: 0,
			todayCiro: 0, todayTahsilat: 0,
			apptList: [], visitList: [], vaccinationList: [], ciroList: [], tahsilatList: [],
		}
		return {
			todayAppts:       todayD.appointments.total,
			completedAppts:   todayD.appointments.completed,
			pendingAppts:     todayD.appointments.pending,
			todayVisits:      todayD.visits.uniquePets,
			activeVisits:     todayD.visits.total,
			todayVaccinations:todayD.vaccinations.total,
			todayCiro:        todayD.ciro.amount,
			todayTahsilat:    todayD.tahsilat.amount,
			apptList:         todayD.appointments.list,
			visitList:        todayD.visits.list,
			vaccinationList:  todayD.vaccinations.list,
			ciroList:         todayD.ciro.list,
			tahsilatList:     todayD.tahsilat.list,
		}
	}, [todayD])

	const todayBottomStats = useMemo(() => {
		if (!todayD || !generalD) return {
			todayRx: [], todayInvoices: [], cancelledAppts: [], rescheduledAppts: [],
			criticalStocks: [], pendingVisits: [], unpaidToday: [],
			todayInvoiceTotal: 0, unpaidInvoiceTotal: 0,
		}
		return {
			todayRx:           todayD.prescriptions.list,
			todayInvoices:     todayD.invoices.list,
			cancelledAppts:    todayD.cancelled.list.filter((a: any) => a.status === "CANCELLED"),
			rescheduledAppts:  todayD.cancelled.list.filter((a: any) => a.status === "PENDING"),
			criticalStocks:    generalD.criticalStocks.list,
			pendingVisits:     todayD.visits.list.filter((v: any) => v.status === "IN_PROGRESS"),
			unpaidToday:       generalD.unpaidVisits.list,
			todayInvoiceTotal: todayD.invoices.paid,
			unpaidInvoiceTotal:todayD.invoices.unpaid,
		}
	}, [todayD, generalD])

	const chartData = useMemo(() => {
		const roleChart = [
			{ name: "Müşteri",    value: userStats.customers },
			{ name: "Personel",   value: userStats.staff },
			{ name: "Admin",      value: userStats.admins },
			{ name: "Süper Admin",value: userStats.superAdmins },
		]
		return {
			appt:        dashData?.charts?.appt  || [],
			rev:         dashData?.charts?.rev   || [],
			role:        roleChart,
			monthlyAppt: [],
		}
	}, [userStats, dashData])

	const recentUsers = useMemo(() =>
		[...users].sort((a,b) => new Date(b.createdAt||now).getTime() - new Date(a.createdAt||now).getTime()).slice(0, 6)
	, [users])

	const dateLabel = selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: tr }) : format(now, "d MMMM yyyy", { locale: tr })

	// popup data resolver
	const popupData = useMemo(() => {
		if (!popup) return []
		if (popup === "appointments")  return todayStats.apptList
		if (popup === "visits")        return todayStats.visitList
		if (popup === "vaccinations")  return todayStats.vaccinationList
		if (popup === "ciro")          return todayStats.ciroList
		if (popup === "tahsilat")      return todayStats.tahsilatList
		return []
	}, [popup, todayStats])

	return (
		<div className="ad-wrap">
			{/* Popup */}
			{popup && (
				<DetailPopup
					type={popup}
					data={popupData}
					dateLabel={dateLabel}
					onClose={() => setPopup(null)}
					formatCurrency={formatCurrency}
				/>
			)}

			{/* Header */}
			<div className="ad-hd">
				<div>
					<h1 className="ad-hd-title">Süper Admin Paneli</h1>
					<p className="ad-hd-sub">
						{isFiltered
							? <span className="sa-date-badge"><Calendar className="w-3 h-3" />{dateLabel} — Tarih Filtresi Aktif</span>
							: <>{dateLabel} — Sistem Yönetimi</>
						}
					</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<div ref={calRef} style={{ position: "relative" }}>
						<button className={`sa-cal-btn${isFiltered ? " sa-cal-btn-active" : ""}`} onClick={() => setCalOpen(v => !v)}>
							<Calendar className="w-4 h-4" />
							<span>Tarih: {isFiltered ? dateLabel : "Tümü"}</span>
							{isFiltered && (
								<span className="sa-cal-x" onClick={e => { e.stopPropagation(); setSelectedDate(null) }}>
									<X className="w-3 h-3" />
								</span>
							)}
						</button>
						{calOpen && <MiniCalendar selected={selectedDate} onChange={setSelectedDate} onClose={() => setCalOpen(false)} />}
					</div>
					<a href="/super/roles" className="sa-mgmt-btn"><Settings className="w-4 h-4" /> Kullanıcı Yönetimi</a>
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
					<button className="sa-incele-btn" onClick={() => setPopup("appointments")}><Eye className="w-3.5 h-3.5" />İncele</button>
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
								: <span className="sa-today-chip sa-chip-gray">aktif yok</span>}
						</div>
					</div>
					<button className="sa-incele-btn" onClick={() => setPopup("visits")}><Eye className="w-3.5 h-3.5" />İncele</button>
				</div>

				{/* Bugün Yapılacak Aşılar */}
				<div className="ad-kpi ad-kpi-violet sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-violet"><Activity className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugün Yapılacak Aşılar</p>
						<p className="ad-kpi-val">{todayStats.todayVaccinations}</p>
						<div className="sa-today-sub">
							{todayStats.todayVaccinations > 0
								? <span className="sa-today-chip sa-chip-violet">hatırlatma var</span>
								: <span className="sa-today-chip sa-chip-gray">aşı yok</span>}
						</div>
					</div>
					<button className="sa-incele-btn" onClick={() => setPopup("vaccinations")}><Eye className="w-3.5 h-3.5" />İncele</button>
				</div>

				{/* Bugünkü Ciro */}
				<div className="ad-kpi ad-kpi-amber sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-amber"><DollarSign className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugünkü Ciro</p>
						<p className="ad-kpi-val">{formatCurrency(todayStats.todayCiro)}</p>
						<p className="ad-kpi-desc">toplam hizmet bedeli</p>
					</div>
					<button className="sa-incele-btn" onClick={() => setPopup("ciro")}><Eye className="w-3.5 h-3.5" />İncele</button>
				</div>

				{/* Bugünkü Tahsilat */}
				<div className="ad-kpi ad-kpi-teal sa-today-kpi">
					<div className="ad-kpi-icon ad-ki-teal"><TrendingUp className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bugünkü Tahsilat</p>
						<p className="ad-kpi-val">{formatCurrency(todayStats.todayTahsilat)}</p>
						<p className="ad-kpi-desc">bugün ödenen faturalar</p>
					</div>
					<button className="sa-incele-btn" onClick={() => setPopup("tahsilat")}><Eye className="w-3.5 h-3.5" />İncele</button>
				</div>
			</div>

			{/* Klinik Nabzı — Bu Ay */}
			<div className="ad-kpi-grid">

				{/* Bu Ay Ciro */}
				<div className="ad-kpi ad-kpi-blue">
					<div className="ad-kpi-icon ad-ki-blue"><TrendingUp className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Bu Ay Ciro</p>
						<p className="ad-kpi-val">{formatCurrency(bizStats.monthRev)}</p>
						{bizStats.prevRev > 0 ? (
							<div className={`ad-kpi-chg ${bizStats.revChange >= 0 ? "ad-up" : "ad-dn"}`}>
								<ArrowUpRight className="w-3 h-3" />
								<span>%{Math.abs(bizStats.revChange).toFixed(1)} geçen aya göre</span>
							</div>
						) : (
							<p className="ad-kpi-desc">geçen ay veri yok</p>
						)}
					</div>
				</div>

				{/* Doluluk Oranı */}
				<div className="ad-kpi ad-kpi-teal">
					<div className="ad-kpi-icon ad-ki-teal"><Activity className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Doluluk Oranı</p>
						<p className="ad-kpi-val">%{bizStats.doluluk}</p>
						{bizStats.dolulukChange !== 0 ? (
							<div className={`ad-kpi-chg ${bizStats.dolulukChange >= 0 ? "ad-up" : "ad-dn"}`}>
								<ArrowUpRight className="w-3 h-3" />
								<span>{bizStats.dolulukChange > 0 ? "+" : ""}{bizStats.dolulukChange} puan geçen aya göre</span>
							</div>
						) : (
							<p className="ad-kpi-desc">{bizStats.completedMonth}/{bizStats.monthAppts} randevu tamamlandı</p>
						)}
					</div>
				</div>

				{/* Yeni Hasta */}
				<div className="ad-kpi ad-kpi-violet">
					<div className="ad-kpi-icon ad-ki-violet"><PawPrint className="w-5 h-5" /></div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Yeni Hasta</p>
						<p className="ad-kpi-val">{bizStats.newPetsMonth}</p>
						{bizStats.newPetsChange !== 0 ? (
							<div className={`ad-kpi-chg ${bizStats.newPetsChange >= 0 ? "ad-up" : "ad-dn"}`}>
								<ArrowUpRight className="w-3 h-3" />
								<span>%{Math.abs(bizStats.newPetsChange).toFixed(1)} geçen aya göre</span>
							</div>
						) : (
							<p className="ad-kpi-desc">bu ay kayıt olan hayvan</p>
						)}
					</div>
				</div>

				{/* Tahsilat Bekleyen */}
				<div className={`ad-kpi ${bizStats.unpaidAmt > 0 ? "ad-kpi-amber" : "ad-kpi-teal"}`}>
					<div className={`ad-kpi-icon ${bizStats.unpaidAmt > 0 ? "ad-ki-amber" : "ad-ki-teal"}`}>
						<AlertCircle className="w-5 h-5" />
					</div>
					<div className="ad-kpi-body">
						<p className="ad-kpi-lbl">Tahsilat Bekleyen</p>
						<p className="ad-kpi-val">{formatCurrency(bizStats.unpaidAmt)}</p>
						{bizStats.unpaidAmt > 0 ? (
							<p className="ad-kpi-desc sa-warn-txt">{bizStats.unpaidCount} fatura ödeme bekliyor</p>
						) : (
							<p className="ad-kpi-desc">tüm ödemeler tamam ✓</p>
						)}
					</div>
				</div>

			</div>

			{/* Sistem Ozeti */}
			<div className="sa-ozet-row">
				<div className="sa-ozet-label">
					<TrendingUp className="w-4 h-4" />
					<span>Sistem Özeti</span>
				</div>
				<div className="sa-ozet-cards">
					{[
						{ icon: <Users className="w-4 h-4" />,      color: "blue",   label: "Toplam Kullanıcı",   val: `${userStats.total}`,              sub: `${userStats.newUsers} bu ay` },
						{ icon: <DollarSign className="w-4 h-4" />, color: "teal",   label: "Tahsil Edilen Gelir",val: formatCurrency(bizStats.allTimeRev), sub: "tüm zamanlar" },
						{ icon: <FileText className="w-4 h-4" />,   color: "amber",  label: "Bekleyen Tahsilat",  val: formatCurrency(bizStats.unpaidAmt),  sub: `${bizStats.unpaidCount} fatura`, warn: bizStats.unpaidAmt > 0 },
						{ icon: <PawPrint className="w-4 h-4" />,   color: "violet", label: "Toplam Hasta",       val: `${bizStats.totalPets}`,            sub: "kayıtlı hayvan" },
					].map((row, i) => (
						<div key={i} className={`sa-ozet-card sa-ozet-${row.color}${(row as any).warn ? " sa-ozet-warn" : ""}`}>
							<div className={`sa-ozet-icon sa-oi-${row.color}`}>{row.icon}</div>
							<div className="sa-ozet-body">
								<p className="sa-ozet-lbl">{row.label}</p>
								<p className={`sa-ozet-val${(row as any).warn ? " sa-ozet-val-warn" : ""}`}>{row.val}</p>
								<p className="sa-ozet-sub">{row.sub}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ===== BUGÜN ALT PANELLERİ ===== */}
			<div className="sa-today-panels-title">
				<span className="sa-tp-dot" />
				<span>Bugün</span>
				<span className="sa-tp-date">{dateLabel}</span>
			</div>

			{/* Row 1: Reçeteler + Faturalar + İptal Randevular */}
			<div className="sa-today-panels-grid">

				{/* Bugün Yazılan Reçeteler */}
				<div className="sa-tp-card">
					<div className="sa-tp-hd sa-tp-hd-violet">
						<div className="sa-tp-hd-icon"><Pill className="w-4 h-4" /></div>
						<div>
							<p className="sa-tp-hd-title">Bugün Yazılan Reçeteler</p>
							<p className="sa-tp-hd-count">{todayBottomStats.todayRx.length} reçete</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{todayBottomStats.todayRx.length === 0 ? (
							<div className="sa-tp-empty"><Pill className="w-5 h-5" /><span>Bugün reçete yazılmadı</span></div>
						) : todayBottomStats.todayRx.slice(0,5).map((rx: any) => (
							<div key={rx.id} className="sa-tp-row">
								<div className="sa-tp-avatar sa-tpa-violet">{(rx.pet?.name||"?").charAt(0)}</div>
								<div className="sa-tp-info">
									<p className="sa-tp-main">{rx.pet?.name || "—"} <span className="sa-tp-species">{rx.pet?.species}</span></p>
									<p className="sa-tp-sub">{rx.medicineName} {rx.dosage ? `· ${rx.dosage}` : ""}</p>
								</div>
								<div className="sa-tp-right">
									{rx.pet?.owner?.phone && (
										<a href={waLink(rx.pet.owner.phone)!} target="_blank" rel="noopener noreferrer" className="sa-tp-wa"><Phone className="w-3 h-3" /></a>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Bugün Kesilen Faturalar */}
				<div className="sa-tp-card">
					<div className="sa-tp-hd sa-tp-hd-blue">
						<div className="sa-tp-hd-icon"><Receipt className="w-4 h-4" /></div>
						<div>
							<p className="sa-tp-hd-title">Bugün Kesilen Faturalar</p>
							<p className="sa-tp-hd-count">{todayBottomStats.todayInvoices.length} fatura · <span className="sa-tp-green">{formatCurrency(todayBottomStats.todayInvoiceTotal)} ödendi</span>{todayBottomStats.unpaidInvoiceTotal > 0 && <span className="sa-tp-amber"> · {formatCurrency(todayBottomStats.unpaidInvoiceTotal)} bekliyor</span>}</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{todayBottomStats.todayInvoices.length === 0 ? (
							<div className="sa-tp-empty"><Receipt className="w-5 h-5" /><span>Bugün fatura kesilmedi</span></div>
						) : todayBottomStats.todayInvoices.slice(0,5).map((inv: any) => (
							<div key={inv.id} className="sa-tp-row">
								<div className={`sa-tp-status-dot ${inv.status === "PAID" ? "sa-dot-green" : "sa-dot-amber"}`} />
								<div className="sa-tp-info">
									<p className="sa-tp-main">
										{inv.visit?.pet?.name || inv.appointment?.pet?.name || "—"}
										{inv.visit && <span className="sa-tp-proto">PRO-{inv.visit.protocolNumber}</span>}
									</p>
									<p className="sa-tp-sub">{inv.appointment?.service?.title || "Ziyaret faturası"}</p>
								</div>
								<div className="sa-tp-right">
									<span className={`sa-tp-amt ${inv.status === "PAID" ? "sa-tp-green" : "sa-tp-amber"}`}>{formatCurrency(inv.amount)}</span>
									<span className={`ad-badge ${inv.status === "PAID" ? "s-completed" : "s-pending"}`}>{inv.status === "PAID" ? "Ödendi" : "Bekliyor"}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Bugün İptal / Ertelenen */}
				<div className="sa-tp-card">
					<div className="sa-tp-hd sa-tp-hd-red">
						<div className="sa-tp-hd-icon"><XCircle className="w-4 h-4" /></div>
						<div>
							<p className="sa-tp-hd-title">Bugün İptal / Bekleyen</p>
							<p className="sa-tp-hd-count">
								{todayBottomStats.cancelledAppts.length > 0 && <span className="sa-tp-red">{todayBottomStats.cancelledAppts.length} iptal</span>}
								{todayBottomStats.cancelledAppts.length > 0 && todayBottomStats.rescheduledAppts.length > 0 && " · "}
								{todayBottomStats.rescheduledAppts.length > 0 && <span className="sa-tp-amber">{todayBottomStats.rescheduledAppts.length} bekliyor</span>}
								{todayBottomStats.cancelledAppts.length === 0 && todayBottomStats.rescheduledAppts.length === 0 && <span>Sorun yok ✓</span>}
							</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{todayBottomStats.cancelledAppts.length === 0 && todayBottomStats.rescheduledAppts.length === 0 ? (
							<div className="sa-tp-empty sa-tp-empty-green"><CheckCircle2 className="w-5 h-5" /><span>Bugün iptal yok, harika!</span></div>
						) : [...todayBottomStats.cancelledAppts, ...todayBottomStats.rescheduledAppts].slice(0,5).map((a: any) => (
							<div key={a.id} className="sa-tp-row">
								<div className="sa-tp-avatar sa-tpa-red">{(a.pet?.name||"?").charAt(0)}</div>
								<div className="sa-tp-info">
									<p className="sa-tp-main">{a.pet?.name || "—"} <span className="sa-tp-species">{a.pet?.species}</span></p>
									<p className="sa-tp-sub">{a.service?.title || "—"} · {format(new Date(a.date), "HH:mm")}</p>
								</div>
								<div className="sa-tp-right">
									<span className={`ad-badge ${a.status === "CANCELLED" ? "s-cancelled" : "s-pending"}`}>{a.status === "CANCELLED" ? "İptal" : "Bekliyor"}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Row 2: Bekleyen İşler + Kritik Stok + Ödenmemiş */}
			<div className="sa-today-panels-grid">

				{/* Bekleyen İşler */}
				<div className="sa-tp-card">
					<div className="sa-tp-hd sa-tp-hd-amber">
						<div className="sa-tp-hd-icon"><Clock className="w-4 h-4" /></div>
						<div>
							<p className="sa-tp-hd-title">Bekleyen İşler</p>
							<p className="sa-tp-hd-count">{todayBottomStats.pendingVisits.length} aktif ziyaret devam ediyor</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{todayBottomStats.pendingVisits.length === 0 ? (
							<div className="sa-tp-empty sa-tp-empty-green"><CheckCircle2 className="w-5 h-5" /><span>Tüm işler tamamlandı</span></div>
						) : todayBottomStats.pendingVisits.slice(0,5).map((v: any) => (
							<div key={v.id} className="sa-tp-row">
								<div className="sa-tp-avatar sa-tpa-amber">{(v.pet?.name||"?").charAt(0)}</div>
								<div className="sa-tp-info">
									<p className="sa-tp-main">{v.pet?.name || "—"} <span className="sa-tp-species">{v.pet?.species}</span></p>
									<p className="sa-tp-sub">PRO-{v.protocolNumber} · Bakiye: {formatCurrency((v.totalAmount||0) - (v.paidAmount||0))}</p>
								</div>
								<div className="sa-tp-right">
									{v.pet?.owner?.phone && (
										<a href={waLink(v.pet.owner.phone)!} target="_blank" rel="noopener noreferrer" className="sa-tp-wa"><Phone className="w-3 h-3" /></a>
									)}
									<span className="ad-badge s-inprogress">Devam</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Kritik Stok */}
				<div className="sa-tp-card">
					<div className="sa-tp-hd sa-tp-hd-red">
						<div className="sa-tp-hd-icon"><Package className="w-4 h-4" /></div>
						<div>
							<p className="sa-tp-hd-title">Kritik Stok Uyarıları</p>
							<p className="sa-tp-hd-count">
								{todayBottomStats.criticalStocks.length === 0
									? <span>Tüm stoklar yeterli ✓</span>
									: <span className="sa-tp-red">{todayBottomStats.criticalStocks.length} ürün kritik seviyede</span>}
							</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{todayBottomStats.criticalStocks.length === 0 ? (
							<div className="sa-tp-empty sa-tp-empty-green"><CheckCircle2 className="w-5 h-5" /><span>Stok seviyeleri normal</span></div>
						) : todayBottomStats.criticalStocks.slice(0,5).map((s: any) => (
							<div key={s.id} className="sa-tp-row">
								<div className={`sa-tp-stock-bar-wrap`}>
									<div className="sa-tp-stock-bar" style={{ width: `${Math.min(100, (s.quantity / Math.max(s.minQuantity,1)) * 100)}%` }} />
								</div>
								<div className="sa-tp-info">
									<p className="sa-tp-main">{s.name}</p>
									<p className="sa-tp-sub">{s.category} · Min: {s.minQuantity} {s.unit}</p>
								</div>
								<div className="sa-tp-right">
									<span className={`sa-tp-stock-qty ${s.quantity === 0 ? "sa-tp-red" : "sa-tp-amber"}`}>{s.quantity} {s.unit}</span>
								</div>
							</div>
						))}
					</div>
					{todayBottomStats.criticalStocks.length > 0 && (
						<div className="sa-tp-footer">
							<a href="/super/stocks" className="sa-tp-link">Stok Yönetimine Git →</a>
						</div>
					)}
				</div>

				{/* Ödenmemiş Bakiyeler */}
				<div className="sa-tp-card">
					<div className="sa-tp-hd sa-tp-hd-orange">
						<div className="sa-tp-hd-icon"><AlertTriangle className="w-4 h-4" /></div>
						<div>
							<p className="sa-tp-hd-title">Ödenmemiş Bakiyeler</p>
							<p className="sa-tp-hd-count">
								{(todayBottomStats.unpaidToday||[]).length === 0
									? <span>Bekleyen borç yok ✓</span>
									: <span className="sa-tp-red">{(todayBottomStats.unpaidToday||[]).length} ziyaret · {formatCurrency((todayBottomStats.unpaidToday||[]).reduce((s:number,v:any)=>s+v.balance,0))} toplam</span>}
							</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{(todayBottomStats.unpaidToday||[]).length === 0 ? (
							<div className="sa-tp-empty sa-tp-empty-green"><CheckCircle2 className="w-5 h-5" /><span>Tüm ödemeler tamam</span></div>
						) : (todayBottomStats.unpaidToday || []).slice(0,5).map((v: any) => (
							<div key={v.id} className="sa-tp-row">
								<div className="sa-tp-avatar sa-tpa-red">{(v.pet?.name||"?").charAt(0)}</div>
								<div className="sa-tp-info">
									<p className="sa-tp-main">{v.pet?.name || "—"} <span className="sa-tp-species">{v.pet?.species}</span></p>
									<p className="sa-tp-sub">{v.pet?.owner?.name || "—"} · {format(new Date(v.visitDate), "d MMM")}</p>
								</div>
								<div className="sa-tp-right">
									{v.pet?.owner?.phone && (
										<a href={waLink(v.pet.owner.phone)!} target="_blank" rel="noopener noreferrer" className="sa-tp-wa"><Phone className="w-3 h-3" /></a>
									)}
									<span className="sa-tp-red sa-tp-bold">{formatCurrency(v.balance)}</span>
								</div>
							</div>
						))}
					</div>
				</div>

			</div>

			{/* Charts */}
			<DashboardCharts
				appointmentsData={chartData.appt}
				revenueData={chartData.rev}
				statusData={chartData.role}
				monthlyApptData={chartData.monthlyAppt}
			/>
		</div>
	)
}
