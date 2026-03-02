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
		const { method, amount, notes } = body

		if (!method || amount === undefined) {
			return NextResponse.json(
				{ error: "Method and amount are required" },
				{ status: 400 }
			)
		}

		const validMethods = ["nakit", "kart", "stripe"]
		if (!validMethods.includes(method)) {
			return NextResponse.json(
				{ error: `Invalid method. Must be one of: ${validMethods.join(", ")}` },
				{ status: 400 }
			)
		}

		const amt = Number(amount)
		if (amt <= 0) {
			return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
		}

		const visit = await prisma.visit.findUnique({
			where: { id: visitId },
			select: {
				id: true,
				totalAmount: true,
				paidAmount: true,
				pet: { select: { ownerId: true } },
			},
		})
		if (!visit) {
			return NextResponse.json({ error: "Visit not found" }, { status: 404 })
		}

		const remaining = visit.totalAmount - visit.paidAmount
		if (amt > remaining) {
			return NextResponse.json(
				{ error: `Amount exceeds remaining balance ($${remaining.toFixed(2)})` },
				{ status: 400 }
			)
		}

		const [payment, updatedVisit] = await prisma.$transaction([
			prisma.visitPayment.create({
				data: {
					visitId,
					method,
					amount: amt,
					notes: notes || null,
					status: "COMPLETED",
				},
				select: {
					id: true,
					visitId: true,
					method: true,
					amount: true,
					status: true,
					paidAt: true,
					notes: true,
				},
			}),
			prisma.visit.update({
				where: { id: visitId },
				data: { paidAmount: { increment: amt } },
				select: { totalAmount: true, paidAmount: true },
			}),
		])

		return NextResponse.json(
			{ ...payment, visitTotal: updatedVisit.totalAmount, visitPaid: updatedVisit.paidAmount },
			{ status: 201 }
		)
	} catch (error) {
		console.error("[Visit Payments API] POST error:", error)
		return NextResponse.json({ error: "Ödeme kaydedilemedi" }, { status: 500 })
	}
}
