import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: visitId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { serviceId, quantity = 1, unitPrice, notes } = body

		if (!serviceId) {
			return NextResponse.json(
				{ error: "Service ID is required" },
				{ status: 400 }
			)
		}

		const visit = await prisma.visit.findUnique({
			where: { id: visitId },
			select: { id: true, status: true, pet: { select: { ownerId: true } } },
		})
		if (!visit) {
			return NextResponse.json({ error: "Visit not found" }, { status: 404 })
		}
		if (visit.status === "CANCELLED") {
			return NextResponse.json(
				{ error: "Cannot add services to cancelled visit" },
				{ status: 400 }
			)
		}

		const service = await prisma.petService.findUnique({
			where: { id: serviceId },
			select: { id: true, price: true },
		})
		if (!service) {
			return NextResponse.json({ error: "Service not found" }, { status: 404 })
		}

		const qty = Math.max(1, Number.parseInt(String(quantity)) || 1)
		const price = unitPrice !== undefined ? Number(unitPrice) : service.price
		const total = qty * price

		const [visitService, updatedVisit] = await prisma.$transaction([
			prisma.visitService.create({
				data: {
					visitId,
					serviceId,
					quantity: qty,
					unitPrice: price,
					total,
					notes: notes || null,
				},
				select: {
					id: true,
					visitId: true,
					serviceId: true,
					quantity: true,
					unitPrice: true,
					total: true,
					notes: true,
					service: {
						select: { id: true, title: true, type: true, price: true },
					},
				},
			}),
			prisma.visit.update({
				where: { id: visitId },
				data: {
					totalAmount: { increment: total },
				},
				select: { totalAmount: true, paidAmount: true },
			}),
		])

		return NextResponse.json(
			{ ...visitService, visitTotal: updatedVisit.totalAmount, visitPaid: updatedVisit.paidAmount },
			{ status: 201 }
		)
	} catch (error) {
		console.error("[Visit Services API] POST error:", error)
		return NextResponse.json({ error: "Hizmet eklenemedi" }, { status: 500 })
	}
}
