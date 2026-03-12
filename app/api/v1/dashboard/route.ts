import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (currentUser.isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

		const { searchParams } = new URL(req.url)
		const dateParam = searchParams.get("date") // "yyyy-MM-dd" formatında

		// Hedef gün
		const now = new Date()
		const targetDate = dateParam ? new Date(dateParam) : now
		const y = targetDate.getFullYear()
		const m = targetDate.getMonth()
		const d = targetDate.getDate()
		const dayStart = new Date(y, m, d, 0, 0, 0, 0)
		const dayEnd   = new Date(y, m, d, 23, 59, 59, 999)

		// Bu ay başı
		const monthStart = new Date(y, m, 1, 0, 0, 0, 0)
		const monthEnd   = new Date(y, m + 1, 0, 23, 59, 59, 999)

		// Geçen ay
		const prevMonthStart = new Date(y, m - 1, 1, 0, 0, 0, 0)
		const prevMonthEnd   = new Date(y, m, 0, 23, 59, 59, 999)

		// ─── Paralel sorgular ───────────────────────────────────────
		const [
			// Bugün
			todayVisits,
			todayAppointments,
			todayPayments,
			todayPrescriptions,
			todayInvoices,
			todayCancelledAppts,
			// Bu ay
			monthVisits,
			prevMonthVisits,
			monthNewPets,
			// Genel
			totalUsers,
			totalPets,
			criticalStocks,
			unpaidVisits,
			allVaccinations,
			chartAppointments,
			chartPayments,
		] = await Promise.all([
			// Bugünkü ziyaretler (tüm kayıtlar, limit yok)
			prisma.visit.findMany({
				where: { visitDate: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } },
				select: {
					id: true, protocolNumber: true, status: true,
					totalAmount: true, paidAmount: true, visitDate: true,
					pet: { select: { id: true, name: true, species: true, owner: { select: { id: true, name: true, email: true, phone: true } } } },
					payments: { select: { id: true, amount: true, method: true, status: true, paidAt: true, createdAt: true } },
				},
			}),

			// Bugünkü randevular
			prisma.appointment.findMany({
				where: { date: { gte: dayStart, lte: dayEnd } },
				select: {
					id: true, date: true, status: true,
					pet: { select: { id: true, name: true, species: true, owner: { select: { id: true, name: true, phone: true } } } },
					service: { select: { id: true, title: true } },
				},
			}),

			// Bugün yapılan ödemeler
			prisma.visitPayment.findMany({
				where: { paidAt: { gte: dayStart, lte: dayEnd } },
				select: {
					id: true, amount: true, method: true, status: true, paidAt: true,
					visit: {
						select: {
							protocolNumber: true,
							pet: { select: { name: true, owner: { select: { name: true, phone: true } } } },
						},
					},
				},
			}),

			// Bugün yazılan reçeteler
			prisma.prescription.findMany({
				where: { dateIssued: { gte: dayStart, lte: dayEnd } },
				select: {
					id: true, dateIssued: true,
					pet: { select: { name: true, species: true, owner: { select: { name: true, phone: true } } } },
					items: { select: { medicineName: true, quantity: true } },
				},
			}),

			// Bugün kesilen faturalar
			prisma.invoice.findMany({
				where: { createdAt: { gte: dayStart, lte: dayEnd } },
				select: { id: true, amount: true, status: true, createdAt: true,
					visit: { select: { protocolNumber: true, pet: { select: { name: true, owner: { select: { name: true, phone: true } } } } } } },
			}),

			// Bugün iptal/bekleyen randevular
			prisma.appointment.findMany({
				where: { date: { gte: dayStart, lte: dayEnd }, status: { in: ["CANCELLED", "PENDING"] } },
				select: { id: true, status: true, date: true,
					pet: { select: { name: true, species: true, owner: { select: { name: true, phone: true } } } } },
			}),

			// Bu ay ziyaretler (ciro için)
			prisma.visit.aggregate({
				where: { visitDate: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } },
				_sum: { totalAmount: true, paidAmount: true },
				_count: { id: true },
			}),

			// Geçen ay ziyaretler (kıyaslama için)
			prisma.visit.aggregate({
				where: { visitDate: { gte: prevMonthStart, lte: prevMonthEnd }, status: { not: "CANCELLED" } },
				_sum: { totalAmount: true },
			}),

			// Bu ay yeni hasta
			prisma.pet.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),

			// Toplam kullanıcı
			prisma.user.count({ where: { isCustomer: false } }),

			// Toplam hasta
			prisma.pet.count(),

			// Kritik stok (limit yok - tümünü al)
			prisma.stockItem.findMany({
				where: { isActive: true },
				select: { id: true, name: true, quantity: true, minQuantity: true, unit: true },
			}),

			// Ödenmemiş bakiyeler (limit yok)
			prisma.visit.findMany({
				where: { status: { not: "CANCELLED" } },
				select: {
					id: true, protocolNumber: true, visitDate: true,
					totalAmount: true, paidAmount: true,
					pet: { select: { name: true, species: true, owner: { select: { id: true, name: true, phone: true } } } },
				},
			}),

			// Bugün yapılacak aşılar
			prisma.vaccination.findMany({
				where: { nextDue: { gte: dayStart, lte: dayEnd } },
				select: {
					id: true, vaccineName: true, nextDue: true, dateGiven: true,
					pet: { select: { name: true, species: true, owner: { select: { name: true, phone: true, email: true } } } },
				},
			}),

			// Son 7 günlük randevu (grafik)
			prisma.appointment.findMany({
				where: { date: { gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) } },
				select: { date: true, status: true },
			}),

			// Son 6 aylık tahsilat (grafik)
			prisma.visitPayment.findMany({
				where: { paidAt: { gte: new Date(y, m - 5, 1) } },
				select: { amount: true, paidAt: true },
			}),
		])

		// ─── Hesaplamalar ───────────────────────────────────────────

		// Bugünkü ciro (bugün açılan ziyaretlerin toplam tutarı)
		const todayCiro = todayVisits.reduce((s, v) => s + (v.totalAmount || 0), 0)

		// Bugünkü tahsilat (bugün yapılan ödemeler)
		const todayTahsilat = todayPayments.reduce((s, p) => s + (p.amount || 0), 0)

		// Tahsilat detay satırları
		const tahsilatList = todayPayments.map(p => ({
			protocolNumber: p.visit?.protocolNumber,
			petName: p.visit?.pet?.name,
			ownerName: p.visit?.pet?.owner?.name,
			ownerPhone: p.visit?.pet?.owner?.phone,
			method: p.method,
			amount: p.amount,
			paidAt: p.paidAt,
		}))

		// Randevu istatistikleri
		const completedAppts = todayAppointments.filter(a => a.status === "COMPLETED").length
		const pendingAppts   = todayAppointments.filter(a => ["PENDING", "CONFIRMED"].includes(a.status)).length

		// Gelen hasta (bugün ziyaret kaydı olan benzersiz hayvanlar)
		const uniquePetsToday = new Set(todayVisits.map(v => v.pet.id)).size

		// Bu ay ciro ve değişim
		const thisMonthCiro = monthVisits._sum.totalAmount || 0
		const prevMonthCiro = prevMonthVisits._sum.totalAmount || 0
		const ciroChange = prevMonthCiro > 0
			? Math.round(((thisMonthCiro - prevMonthCiro) / prevMonthCiro) * 100)
			: null

		// Doluluk oranı (bu ay tamamlanan/toplam randevu)
		const monthAppts = await prisma.appointment.findMany({
			where: { date: { gte: monthStart, lte: monthEnd } },
			select: { status: true },
		})
		const doluluk = monthAppts.length > 0
			? Math.round((monthAppts.filter(a => a.status === "COMPLETED").length / monthAppts.length) * 100)
			: 0

		// Kritik stok
		const criticalStockList = criticalStocks.filter(s => s.quantity <= s.minQuantity)

		// Ödenmemiş bakiyeler
		const unpaidList = unpaidVisits
			.filter(v => (v.totalAmount - v.paidAmount) > 0.01)
			.map(v => ({ ...v, balance: v.totalAmount - v.paidAmount }))

		const totalUnpaid = unpaidList.reduce((s, v) => s + v.balance, 0)

		// Bugün fatura toplamı
		const todayInvoicePaid   = todayInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0)
		const todayInvoiceUnpaid = todayInvoices.filter(i => i.status !== "PAID").reduce((s, i) => s + i.amount, 0)

		// ─── Grafik verileri ────────────────────────────────────
		const apptChart = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(now); d.setDate(d.getDate() - (6 - i))
			const ds = d.toISOString().slice(0, 10)
			const label = `${d.getDate()} ${d.toLocaleString("tr-TR", { month: "short" })}`
			return { name: label, value: chartAppointments.filter(a => a.date.toISOString().slice(0, 10) === ds).length }
		})
		const revChart = Array.from({ length: 6 }, (_, i) => {
			const d = new Date(y, m - (5 - i), 1)
			const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
			const label = d.toLocaleString("tr-TR", { month: "short", year: "2-digit" })
			return { name: label, value: chartPayments.filter(p => p.paidAt && p.paidAt.toISOString().slice(0, 7) === ym).reduce((s, p) => s + p.amount, 0) }
		})

		return NextResponse.json({
			// Bugün KPI'lar
			today: {
				appointments:     { total: todayAppointments.length, completed: completedAppts, pending: pendingAppts, list: todayAppointments },
				visits:           { total: todayVisits.length, uniquePets: uniquePetsToday, list: todayVisits },
				vaccinations:     { total: allVaccinations.length, list: allVaccinations },
				ciro:             { amount: todayCiro, list: todayVisits },
				tahsilat:         { amount: todayTahsilat, list: tahsilatList },
				prescriptions:    { total: todayPrescriptions.length, list: todayPrescriptions },
				invoices:         { total: todayInvoices.length, paid: todayInvoicePaid, unpaid: todayInvoiceUnpaid, list: todayInvoices },
				cancelled:        { list: todayCancelledAppts },
			},
			// Bu ay / Klinik nabzı
			month: {
				ciro:      { amount: thisMonthCiro, change: ciroChange },
				doluluk:   { percent: doluluk, completed: monthAppts.filter(a => a.status === "COMPLETED").length, total: monthAppts.length },
				newPets:   monthNewPets,
				unpaid:    { amount: totalUnpaid, count: unpaidList.length },
			},
			// Genel
			general: {
				totalUsers,
				totalPets,
				criticalStocks: { count: criticalStockList.length, list: criticalStockList },
				unpaidVisits:   { count: unpaidList.length, total: totalUnpaid, list: unpaidList },
				allTimeRevenue: (await prisma.visit.aggregate({ _sum: { paidAmount: true } }))._sum.paidAmount ?? 0,
			},
			charts: { appt: apptChart, rev: revChart },
		})
	} catch (error) {
		console.error("[Dashboard Stats API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
	}
}
