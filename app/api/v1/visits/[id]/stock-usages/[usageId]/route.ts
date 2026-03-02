import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

// DELETE — stok kullanımını geri al (stok iade et + bakiyeden düş)
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; usageId: string }> }
) {
	try {
		const { id: visitId, usageId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

		const usage = await prisma.visitStockUsage.findUnique({
			where: { id: usageId },
			include: { stockItem: true },
		})
		if (!usage || usage.visitId !== visitId)
			return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 })

		// Transaction: kullanımı sil + stoğu iade et + bakiyeyi güncelle
		await prisma.$transaction([
			prisma.visitStockUsage.delete({ where: { id: usageId } }),
			prisma.stockItem.update({
				where: { id: usage.stockItemId },
				data: { quantity: { increment: usage.quantity } },
			}),
			prisma.visit.update({
				where: { id: visitId },
				data: { totalAmount: { decrement: usage.total } },
			}),
		])

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("[VisitStockUsage DELETE]", error)
		return NextResponse.json({ error: "Failed to remove stock usage" }, { status: 500 })
	}
}
