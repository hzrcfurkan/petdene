import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; paymentId: string }> }
) {
	try {
		const { id: visitId, paymentId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const payment = await prisma.visitPayment.findUnique({
			where: { id: paymentId },
			select: { id: true, visitId: true, amount: true },
		})
		if (!payment || payment.visitId !== visitId) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 })
		}

		await prisma.$transaction([
			prisma.visitPayment.delete({ where: { id: paymentId } }),
			prisma.visit.update({
				where: { id: visitId },
				data: { paidAmount: { decrement: payment.amount } },
			}),
		])

		return NextResponse.json({ message: "Ödeme iptal edildi" })
	} catch (error) {
		console.error("[Visit Payment DELETE] error:", error)
		return NextResponse.json({ error: "Ödeme iptal edilemedi" }, { status: 500 })
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; paymentId: string }> }
) {
	try {
		const { id: visitId, paymentId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const payment = await prisma.visitPayment.findUnique({
			where: { id: paymentId },
			select: { id: true, visitId: true, amount: true },
		})
		if (!payment || payment.visitId !== visitId) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 })
		}

		const body = await req.json()
		const { method, amount, notes } = body

		const newAmt = amount !== undefined ? Number(amount) : payment.amount
		if (newAmt <= 0) return NextResponse.json({ error: "Tutar pozitif olmalı" }, { status: 400 })

		const diff = newAmt - payment.amount

		const [updated] = await prisma.$transaction([
			prisma.visitPayment.update({
				where: { id: paymentId },
				data: {
					...(method !== undefined && { method }),
					...(amount !== undefined && { amount: newAmt }),
					...(notes !== undefined && { notes: notes || null }),
				},
				select: { id: true, method: true, amount: true, status: true, paidAt: true, notes: true },
			}),
			prisma.visit.update({
				where: { id: visitId },
				data: { paidAmount: { increment: diff } },
			}),
		])

		return NextResponse.json(updated)
	} catch (error) {
		console.error("[Visit Payment PUT] error:", error)
		return NextResponse.json({ error: "Ödeme güncellenemedi" }, { status: 500 })
	}
}
