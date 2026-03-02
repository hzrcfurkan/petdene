import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const date = searchParams.get("date") // YYYY-MM-DD for single day
		const dateFrom = searchParams.get("dateFrom") // YYYY-MM-DD for range
		const dateTo = searchParams.get("dateTo") // YYYY-MM-DD for range

		// Support both single date and date range
		let rangeStart: Date
		let rangeEnd: Date
		if (dateFrom && dateTo) {
			rangeStart = new Date(dateFrom + "T00:00:00.000Z")
			rangeEnd = new Date(dateTo + "T23:59:59.999Z")
		} else if (date) {
			rangeStart = new Date(date + "T00:00:00.000Z")
			rangeEnd = new Date(date + "T23:59:59.999Z")
		} else {
			const today = new Date().toISOString().split("T")[0]
			rangeStart = new Date(today + "T00:00:00.000Z")
			rangeEnd = new Date(today + "T23:59:59.999Z")
		}

		const dailyPayments = await prisma.visitPayment.aggregate({
			where: {
				paidAt: { gte: rangeStart, lte: rangeEnd },
				status: "COMPLETED",
			},
			_sum: { amount: true },
			_count: true,
		})

		const dailyRevenue = dailyPayments._sum.amount ?? 0

		// Total outstanding debt and per-customer balances
		const visitsWithDebt = await prisma.visit.findMany({
			where: { status: { not: "CANCELLED" } },
			select: {
				totalAmount: true,
				paidAmount: true,
				pet: { select: { ownerId: true, owner: { select: { name: true, email: true } } } },
			},
		})

		let totalOutstandingDebt = 0
		const customerDebtMap = new Map<
			string,
			{ ownerId: string; ownerName: string; ownerEmail: string; totalDebt: number }
		>()

		for (const v of visitsWithDebt) {
			const balance = v.totalAmount - v.paidAmount
			if (balance > 0) {
				totalOutstandingDebt += balance
				const ownerId = v.pet.ownerId
				const existing = customerDebtMap.get(ownerId)
				if (existing) {
					existing.totalDebt += balance
				} else {
					customerDebtMap.set(ownerId, {
						ownerId,
						ownerName: v.pet.owner.name || "Bilinmiyor",
						ownerEmail: v.pet.owner.email,
						totalDebt: balance,
					})
				}
			}
		}

		const customerBalances = Array.from(customerDebtMap.values())

		return NextResponse.json({
			dailyRevenue: {
				date: rangeStart.toISOString().split("T")[0],
				dateTo: dateFrom && dateTo ? rangeEnd.toISOString().split("T")[0] : undefined,
				amount: dailyRevenue,
				transactionCount: dailyPayments._count,
			},
			totalOutstandingDebt,
			customerBalances,
		})
	} catch (error) {
		console.error("[Reports API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
	}
}
