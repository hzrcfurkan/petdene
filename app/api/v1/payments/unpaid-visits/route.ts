import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET unpaid visits with customer balance info.
 * Used by the Payment screen to show all outstanding balances.
 */
export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")

		const visitWhere: any = { status: { not: "İptal Edildi" } }
		if (dateFrom || dateTo) {
			visitWhere.visitDate = {}
			if (dateFrom) visitWhere.visitDate.gte = new Date(dateFrom + "T00:00:00.000Z")
			if (dateTo) visitWhere.visitDate.lte = new Date(dateTo + "T23:59:59.999Z")
		}

		const visits = await prisma.visit.findMany({
			where: visitWhere,
			select: {
				id: true,
				protocolNumber: true,
				visitDate: true,
				totalAmount: true,
				paidAmount: true,
				pet: {
					select: {
						id: true,
						patientNumber: true,
						name: true,
						species: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
								phone: true,
							},
						},
					},
				},
			},
			orderBy: { visitDate: "desc" },
		})

		// Filter: CUSTOMER only sees their own pets' visits; only visits with balance > 0
		let filtered = visits.filter((v) => {
			const balance = v.totalAmount - v.paidAmount
			return balance > 0 && (currentUser.isCustomer ? v.pet.owner.id === currentUser.id : true)
		})

		// Compute balance per visit
		const unpaidVisits = filtered.map((v) => ({
			...v,
			balance: v.totalAmount - v.paidAmount,
		}))

		// Compute customer balances (group by owner)
		const customerBalances: Record<
			string,
			{ ownerId: string; ownerName: string; ownerEmail: string; totalDebt: number; visitCount: number }
		> = {}
		for (const v of unpaidVisits) {
			const ownerId = v.pet.owner.id
			if (!customerBalances[ownerId]) {
				customerBalances[ownerId] = {
					ownerId,
					ownerName: v.pet.owner.name || "Bilinmiyor",
					ownerEmail: v.pet.owner.email,
					totalDebt: 0,
					visitCount: 0,
				}
			}
			customerBalances[ownerId].totalDebt += v.totalAmount - v.paidAmount
			customerBalances[ownerId].visitCount += 1
		}

		return NextResponse.json({
			unpaidVisits,
			customerBalances: Object.values(customerBalances),
			totalOutstanding: unpaidVisits.reduce((sum, v) => sum + (v.totalAmount - v.paidAmount), 0),
		})
	} catch (error) {
		console.error("[Unpaid Visits API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch unpaid visits" }, { status: 500 })
	}
}
