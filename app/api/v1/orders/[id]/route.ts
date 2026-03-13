import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

const ORDER_INCLUDE = {
	pet:        { select: { id: true, name: true, species: true, patientNumber: true, owner: { select: { id: true, name: true, phone: true } } } },
	visit:      { select: { id: true, protocolNumber: true } },
	orderedBy:  { select: { id: true, name: true, email: true } },
	assignedTo: { select: { id: true, name: true, email: true } },
	stockItem:  { select: { id: true, name: true, unit: true } },
	logs: {
		orderBy: { createdAt: "desc" as const },
		include: { user: { select: { id: true, name: true, email: true } } },
	},
}

// GET /api/v1/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		const { id } = await params
		const order = await prisma.vetOrder.findUnique({ where: { id }, include: ORDER_INCLUDE })
		if (!order) return NextResponse.json({ error: "Order bulunamadı" }, { status: 404 })
		return NextResponse.json(order)
	} catch (error) {
		console.error("[order GET]", error)
		return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
	}
}

// PATCH /api/v1/orders/[id]
// Hem düzenleme hem durum değiştirme (status, note)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (!canAccessResource(currentUser.role as any, "STAFF"))
			return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 })

		const { id } = await params
		const order = await prisma.vetOrder.findUnique({ where: { id } })
		if (!order) return NextResponse.json({ error: "Order bulunamadı" }, { status: 404 })

		const body = await req.json()
		const {
			status, note,
			// düzenleme alanları
			title, description, type,
			dose, route, frequency, duration,
			stockItemId, scheduledAt, priority,
			assignedToId, chargeToVisit, unitPrice,
		} = body

		const updateData: any = {}
		const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "SKIPPED"]

		// Durum geçişleri
		if (status && validStatuses.includes(status)) {
			updateData.status = status
		}

		// Düzenleme alanları
		if (title       !== undefined) updateData.title       = title
		if (description !== undefined) updateData.description = description
		if (type        !== undefined) updateData.type        = type
		if (dose        !== undefined) updateData.dose        = dose
		if (route       !== undefined) updateData.route       = route
		if (frequency   !== undefined) updateData.frequency   = frequency
		if (duration    !== undefined) updateData.duration    = duration
		if (stockItemId !== undefined) updateData.stockItemId = stockItemId || null
		if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
		if (priority    !== undefined) updateData.priority    = priority
		if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null
		if (chargeToVisit !== undefined) updateData.chargeToVisit = chargeToVisit
		if (unitPrice   !== undefined) updateData.unitPrice   = unitPrice

		// Log action belirle
		const logAction = status === "COMPLETED" ? "COMPLETED"
			: status === "CANCELLED"  ? "CANCELLED"
			: status === "SKIPPED"    ? "SKIPPED"
			: status === "IN_PROGRESS" ? "STARTED"
			: note ? "NOTE" : "UPDATED"

		const updated = await prisma.vetOrder.update({
			where: { id },
			data: {
				...updateData,
				logs: {
					create: {
						userId: currentUser.id,
						action: logAction,
						note:   note || (status ? `Durum değiştirildi: ${status}` : "Güncellendi"),
					},
				},
			},
			include: ORDER_INCLUDE,
		})

		// ── Fatura mantığı ──────────────────────────────────────────────────────
		// Eski durum: aktif mi? (CANCELLED/SKIPPED ise faturada zaten 0'dı)
		const wasActive    = order.status !== "CANCELLED" && order.status !== "SKIPPED"
		const becomesCancel = (status === "CANCELLED" || status === "SKIPPED") && wasActive

		// Sonraki değerler
		const nextCharge = updateData.chargeToVisit !== undefined ? updateData.chargeToVisit : order.chargeToVisit
		const nextPrice  = updateData.unitPrice     !== undefined ? updateData.unitPrice     : (order.unitPrice || 0)

		// Önceki faturaya yansıyan tutar
		const oldBilled = wasActive && order.chargeToVisit ? (order.unitPrice || 0) : 0
		// Yeni faturaya yansıyacak tutar (iptal oluyorsa 0)
		const newBilled = (!becomesCancel && nextCharge) ? nextPrice : 0

		const diff = newBilled - oldBilled
		if (diff !== 0 && order.visitId) {
			await prisma.visit.update({
				where: { id: order.visitId },
				data:  { totalAmount: { increment: diff } },
			})
		}

		// COMPLETED ise stok düş
		if (status === "COMPLETED" && order.status !== "COMPLETED" && order.stockItemId) {
			await prisma.stockItem.update({
				where: { id: order.stockItemId },
				data:  { quantity: { decrement: 1 } },
			})
		}
		// ────────────────────────────────────────────────────────────────────────

		return NextResponse.json(updated)
	} catch (error) {
		console.error("[order PATCH]", error)
		return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 })
	}
}

// DELETE /api/v1/orders/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (!canAccessResource(currentUser.role as any, "ADMIN"))
			return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 })

		const { id } = await params
		const order = await prisma.vetOrder.findUnique({ where: { id } })
		if (!order) return NextResponse.json({ error: "Order bulunamadı" }, { status: 404 })

		// COMPLETED order silinemez
		if (order.status === "COMPLETED")
			return NextResponse.json({ error: "Tamamlanmış order silinemez" }, { status: 400 })

		await prisma.vetOrder.delete({ where: { id } })
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("[order DELETE]", error)
		return NextResponse.json({ error: "Silinemedi" }, { status: 500 })
	}
}
