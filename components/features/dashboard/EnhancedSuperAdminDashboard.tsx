"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { useStats, useAppointments, usePets, useInvoices } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { format, isSameDay, startOfDay, endOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import {
	Users, UserCheck, Shield, UserPlus,
	Calendar, PawPrint, DollarSign, FileText,
	ArrowUpRight, Activity, TrendingUp, Settings,
	ChevronLeft, ChevronRight, X, Eye, Phone, Mail,
	AlertTriangle, AlertCircle, Clock, Receipt, Pill, Package, CheckCircle2, XCircle, RotateCcw,
} from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"
import { usePrescriptions } from "@/lib/react-query/hooks/prescriptions"
import { useStocks } from "@/lib/react-query/hooks/stocks"
import { useUnpaidVisits } from "@/lib/react-query/hooks/payments"


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
									<th>Aşı Adı</th><th>Hasta</th><th>Tür</th><th>Sahip</th><th>Telefon</th><th>E-posta</th><th>Son Aşı</th>
								</tr></thead>
								<tbody>
									{data.map((v: any) => (
										<tr key={v.id}>
											<td><span className="sa-pt-name">{v.vaccineName}</span></td>
											<td>{v.pet?.name || "—"}</td>
											<td>{v.pet?.species || "—"}</td>
											<td>{v.pet?.owner?.name || "—"}</td>
											<td>
												{waLink(v.pet?.owner?.phone)
													? <a href={waLink(v.pet?.owner?.phone)!} target="_blank" rel="noopener noreferrer" className="sa-pt-phone sa-pt-wa"><Phone className="w-3 h-3" />{v.pet?.owner?.phone}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
											<td>
												{v.pet?.owner?.email
													? <a href={`mailto:${v.pet.owner.email}`} className="sa-pt-phone"><Mail className="w-3 h-3" />{v.pet.owner.email}</a>
													: <span className="sa-pt-none">—</span>}
											</td>
											<td>{v.dateGiven ? format(new Date(v.dateGiven), "d MMM yyyy") : "—"}</td>
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
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })
	const { data: visitsData } = useVisits({ limit: 1000 })
	const { data: vaccinationsData }  = useVaccinations({ limit: 1000 })
	const { data: prescriptionsData } = usePrescriptions({ limit: 1000 })
	const { data: stocksData }        = useStocks({ limit: 1000 })
	const { data: unpaidData }        = useUnpaidVisits()

	const users        = usersResponse?.users || []
	const appointments = appointmentsData?.appointments || []
	const pets         = petsData?.pets || []
	const invoices     = invoicesData?.invoices || []
	const visits       = visitsData?.visits || []
	const vaccinations  = vaccinationsData?.vaccinations || []
	const prescriptions = prescriptionsData?.prescriptions || []
	const stocks        = (stocksData as any)?.items || (stocksData as any)?.stocks || []
	const unpaidVisits  = unpaidData?.unpaidVisits || []

	// ---- Takvim state ----
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [calOpen, setCalOpen]           = useState(false)
	const [popup, setPopup]               = useState<PopupType>(null)
	const calRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false)
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [])

	const now = new Date()

	const filterStart = selectedDate ? startOfDay(selectedDate) : null
	const filterEnd   = selectedDate ? endOfDay(selectedDate)   : null
	const isFiltered  = !!selectedDate

	const filteredAppointments = useMemo(() =>
		isFiltered ? appointments.filter(a => { const d = new Date(a.date); return d >= filterStart! && d <= filterEnd! }) : appointments
	, [appointments, isFiltered, filterStart, filterEnd])

	const filteredInvoices = useMemo(() =>
		isFiltered ? invoices.filter(i => { const d = new Date(i.createdAt); return d >= filterStart! && d <= filterEnd! }) : invoices
	, [invoices, isFiltered, filterStart, filterEnd])

	const filteredVisits = useMemo(() =>
		isFiltered ? visits.filter(v => { const d = new Date(v.visitDate || v.createdAt); return d >= filterStart! && d <= filterEnd! }) : visits
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

		// Bu ay / geçen ay ciro → visits.totalAmount bazlı (fatura kesilmeden de doğru gösterir)
		const monthRev  = visits.filter(v => v.visitDate && new Date(v.visitDate) >= thirtyDaysAgo && v.status !== "CANCELLED").reduce((s,v)=>s+(v.totalAmount||0),0)
		const prevRev   = visits.filter(v => v.visitDate && new Date(v.visitDate) >= prevThirtyDays && new Date(v.visitDate) < thirtyDaysAgo && v.status !== "CANCELLED").reduce((s,v)=>s+(v.totalAmount||0),0)
		const revChange = prevRev > 0 ? ((monthRev - prevRev) / prevRev) * 100 : 0

		// Doluluk oranı: bu aydaki randevuların kaçı COMPLETED
		const monthAppts     = appointments.filter(a => new Date(a.date) >= thirtyDaysAgo)
		const completedMonth = monthAppts.filter(a => a.status === "COMPLETED").length
		const doluluk        = monthAppts.length > 0 ? Math.round((completedMonth / monthAppts.length) * 100) : 0
		const prevMonthAppts     = appointments.filter(a => new Date(a.date) >= prevThirtyDays && new Date(a.date) < thirtyDaysAgo)
		const prevCompleted      = prevMonthAppts.filter(a => a.status === "COMPLETED").length
		const prevDoluluk        = prevMonthAppts.length > 0 ? Math.round((prevCompleted / prevMonthAppts.length) * 100) : 0
		const dolulukChange      = prevDoluluk > 0 ? doluluk - prevDoluluk : 0

		// Yeni hasta: bu ay ilk kez kayıt olan hayvanlar
		const newPetsMonth  = pets.filter(p => p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo).length
		const prevPetsMonth = pets.filter(p => p.createdAt && new Date(p.createdAt) >= prevThirtyDays && new Date(p.createdAt) < thirtyDaysAgo).length
		const newPetsChange = prevPetsMonth > 0 ? ((newPetsMonth - prevPetsMonth) / prevPetsMonth) * 100 : 0

		// Tahsilat bekleyen → visits'teki ödenmemiş bakiyeler
		const unpaidAmt = unpaidVisits.reduce((s,v)=>s+(v.balance||0),0)

		return {
			totalRev:    paid.reduce((s,i)=>s+i.amount,0),
			allTimeRev:  visits.filter(v=>v.status!=="CANCELLED").reduce((s,v)=>s+(v.paidAmount||0),0),
			monthRev, revChange, prevRev,
			doluluk, dolulukChange, completedMonth, monthAppts: monthAppts.length,
			newPetsMonth, newPetsChange,
			unpaidAmt,
			totalAppts:  filteredAppointments.length,
			recentAppts: filteredAppointments.length,
			totalPets:   pets.length,
			totalInv:    filteredInvoices.length,
			paidCount:   paid.length,
			unpaidCount: unpaidVisits.length,
		}
	}, [filteredAppointments, filteredInvoices, pets, appointments, invoices, visits, unpaidVisits, thirtyDaysAgo, prevThirtyDays])

	const todayStats = useMemo(() => {
		const activeDate = selectedDate || now
		const todayStr   = format(activeDate, "yyyy-MM-dd")

		const todayAppts = appointments.filter(a => format(new Date(a.date), "yyyy-MM-dd") === todayStr)
		const completedAppts = todayAppts.filter(a => a.status === "COMPLETED").length
		const pendingAppts   = todayAppts.filter(a => ["PENDING","CONFIRMED"].includes(a.status)).length

		const todayVisitList = visits.filter(v => {
			const d = v.visitDate || v.createdAt
			if (!d) return false
			try { return format(new Date(d), "yyyy-MM-dd") === todayStr } catch { return false }
		})
		const activeVisits = todayVisitList.length // bugün kaydı açılan tüm hayvanlar

		const todayVaccinationList = vaccinations.filter(v =>
			v.nextDue?.slice(0, 10) === todayStr ||
			(v as any).scheduledDate?.slice(0, 10) === todayStr
		)

		const todayCiro = todayVisitList.reduce((s, v) => s + (v.totalAmount || 0), 0)

		// Tahsilat: payments array varsa kullan, yoksa paidAmount
		const todayTahsilatRows: any[] = []
		visits.forEach(v => {
			if (v.payments && v.payments.length > 0) {
				v.payments
					.filter((p: any) => p.status === "COMPLETED" && p.paidAt?.slice(0,10) === todayStr)
					.forEach((p: any) => {
						todayTahsilatRows.push({
							protocolNumber: v.protocolNumber,
							petName:   v.pet?.name,
							ownerName: v.pet?.owner?.name || v.pet?.owner?.email,
							ownerPhone:v.pet?.owner?.phone,
							method:    p.method,
							amount:    p.amount,
							paidAt:    p.paidAt,
						})
					})
			}
		})
		const todayTahsilat = todayTahsilatRows.length > 0
			? todayTahsilatRows.reduce((s, r) => s + r.amount, 0)
			: todayVisitList.reduce((s, v) => s + (v.paidAmount || 0), 0)

		return {
			todayAppts: todayAppts.length, completedAppts, pendingAppts,
			todayVisits: todayVisitList.length, activeVisits,
			todayVaccinations: todayVaccinationList.length,
			todayCiro, todayTahsilat,
			// popup data
			apptList:        todayAppts,
			visitList:       todayVisitList,
			vaccinationList: todayVaccinationList,
			ciroList:        todayVisitList,
			tahsilatList:    todayTahsilatRows,
		}
	}, [appointments, visits, vaccinations, invoices, selectedDate])

	const todayBottomStats = useMemo(() => {
		const activeDate = selectedDate || now
		const todayStr   = format(activeDate, "yyyy-MM-dd")

		// Bugünkü reçeteler
		const todayRx = prescriptions.filter(p => p.dateIssued?.slice(0,10) === todayStr)

		// Bugün kesilen faturalar
		const todayInvoices = invoices.filter(i => i.createdAt?.slice(0,10) === todayStr)

		// Bugün iptal/ertelenen randevular
		const cancelledAppts = appointments.filter(a =>
			format(new Date(a.date), "yyyy-MM-dd") === todayStr && a.status === "CANCELLED"
		)
		const rescheduledAppts = appointments.filter(a =>
			format(new Date(a.date), "yyyy-MM-dd") === todayStr && a.status === "PENDING"
		)

		// Kritik stok (minQuantity altında)
		const criticalStocks = stocks.filter((s: any) => s.isActive && s.quantity <= s.minQuantity)

		// Bekleyen işler: tamamlanmamış bugünkü ziyaretler (IN_PROGRESS)
		const pendingVisits = visits.filter(v =>
			v.visitDate?.slice(0,10) === todayStr && v.status === "IN_PROGRESS"
		)
		// Ödenmemiş bakiye olan ziyaretler (bakiye > 0)
		const unpaidToday = unpaidVisits.filter(v => v.visitDate?.slice(0,10) === todayStr)

		return {
			todayRx, todayInvoices, cancelledAppts, rescheduledAppts,
			criticalStocks, pendingVisits, unpaidToday,
			todayInvoiceTotal: todayInvoices.filter(i => i.status === "PAID").reduce((s,i) => s + i.amount, 0),
			unpaidInvoiceTotal: todayInvoices.filter(i => i.status === "UNPAID").reduce((s,i) => s + i.amount, 0),
		}
	}, [prescriptions, invoices, appointments, stocks, visits, unpaidVisits, selectedDate])

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
			{ name: "Müşteri", value: userStats.customers },
			{ name: "Personel", value: userStats.staff },
			{ name: "Admin", value: userStats.admins },
			{ name: "Süper Admin", value: userStats.superAdmins },
		]
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

			{/* Charts */}
			<DashboardCharts
				appointmentsData={chartData.appt}
				revenueData={chartData.rev}
				statusData={chartData.role}
				monthlyApptData={chartData.monthlyAppt}
			/>

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
								{unpaidVisits.length === 0
									? <span>Bekleyen borç yok ✓</span>
									: <span className="sa-tp-red">{unpaidVisits.length} ziyaret · {formatCurrency(unpaidVisits.reduce((s,v)=>s+v.balance,0))} toplam</span>}
							</p>
						</div>
					</div>
					<div className="sa-tp-list">
						{unpaidVisits.length === 0 ? (
							<div className="sa-tp-empty sa-tp-empty-green"><CheckCircle2 className="w-5 h-5" /><span>Tüm ödemeler tamam</span></div>
						) : unpaidVisits.slice(0,5).map((v: any) => (
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
		</div>
	)
}
