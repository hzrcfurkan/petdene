import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: visitId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

		const usages = await prisma.visitStockUsage.findMany({
			where: { visitId },
			include: { stockItem: true },
			orderBy: { createdAt: "asc" },
		})
		return NextResponse.json({ usages })
	} catch (error) {
		console.error("[VisitStockUsage GET]", error)
		return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
	}
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: visitId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (currentUser.isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

		const body = await req.json()
		const { stockItemId, quantity, unitPrice, notes } = body

		if (!stockItemId || !quantity)
			return NextResponse.json({ error: "stockItemId ve quantity zorunlu" }, { status: 400 })

		const qty = Number(quantity)
		if (qty <= 0) return NextResponse.json({ error: "Miktar 0'dan büyük olmalı" }, { status: 400 })

		const stockItem = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
		if (!stockItem) return NextResponse.json({ error: "Stok kalemi bulunamadı" }, { status: 404 })
		if (stockItem.quantity < qty)
			return NextResponse.json({ error: `Yetersiz stok. Mevcut: ${stockItem.quantity} ${stockItem.unit}` }, { status: 400 })

		const visit = await prisma.visit.findUnique({ where: { id: visitId }, select: { id: true, status: true } })
		if (!visit) return NextResponse.json({ error: "Ziyaret bulunamadı" }, { status: 404 })
		if (visit.status === "İptal Edildi")
			return NextResponse.json({ error: "İptal edilmiş ziyarete stok eklenemez" }, { status: 400 })

		const price = unitPrice !== undefined ? Number(unitPrice) : stockItem.price
		const total = qty * price

		const [usage, , updatedVisit] = await prisma.$transaction([
			prisma.visitStockUsage.create({
				data: { visitId, stockItemId, quantity: qty, unitPrice: price, total, notes: notes || null },
				include: { stockItem: true },
			}),
			prisma.stockItem.update({
				where: { id: stockItemId },
				data: { quantity: { decrement: qty } },
			}),
			prisma.visit.update({
				where: { id: visitId },
				data: { totalAmount: { increment: total } },
				select: { totalAmount: true, paidAmount: true },
			}),
		])

		return NextResponse.json({ ...usage, visitTotal: updatedVisit.totalAmount, visitPaid: updatedVisit.paidAmount }, { status: 201 })
	} catch (error) {
		console.error("[VisitStockUsage POST]", error)
		return NextResponse.json({ error: "Failed to add stock usage" }, { status: 500 })
	}
}
