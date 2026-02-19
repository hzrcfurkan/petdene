import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const payment = await prisma.payment.findUnique({
			where: { id },
			select: {
				id: true,
				invoiceId: true,
				method: true,
				transactionId: true,
				amount: true,
				paidAt: true,
				invoice: {
					select: {
						id: true,
						status: true,
						amount: true,
						appointment: {
							select: {
								id: true,
								date: true,
								pet: {
									select: {
										id: true,
										name: true,
										species: true,
										ownerId: true,
										owner: {
											select: {
												id: true,
												name: true,
												email: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		})

		if (!payment) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 })
		}

		if (
			currentUser.isCustomer &&
			payment.invoice?.appointment?.pet.ownerId !== currentUser.id
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		return NextResponse.json(payment)
	} catch (error) {
		console.error("[Payments API] GET by ID error:", error)
		return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const existingPayment = await prisma.payment.findUnique({
			where: { id },
		})

		if (!existingPayment) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 })
		}

		const body = await req.json()
		const { method, transactionId, amount, paidAt } = body

		const updateData: any = {}

		if (method !== undefined) updateData.method = method
		if (transactionId !== undefined) updateData.transactionId = transactionId || null
		if (amount !== undefined) {
			if (amount < 0) {
				return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
			}
			updateData.amount = amount
		}
		if (paidAt !== undefined) {
			const paidAtValue = new Date(paidAt)
			if (Number.isNaN(paidAtValue.getTime())) {
				return NextResponse.json({ error: "Invalid paidAt value" }, { status: 400 })
			}
			updateData.paidAt = paidAtValue
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const updatedPayment = await prisma.payment.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				invoiceId: true,
				method: true,
				transactionId: true,
				amount: true,
				paidAt: true,
			},
		})

		return NextResponse.json(updatedPayment)
	} catch (error) {
		console.error("[Payments API] PUT error:", error)
		return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const existingPayment = await prisma.payment.findUnique({
			where: { id },
			select: {
				id: true,
				invoiceId: true,
			},
		})

		if (!existingPayment) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 })
		}

		await prisma.$transaction([
			prisma.payment.delete({ where: { id } }),
			prisma.invoice.update({
				where: { id: existingPayment.invoiceId },
				data: { status: "UNPAID" },
			}),
		])

		return NextResponse.json({ message: "Payment deleted successfully" })
	} catch (error) {
		console.error("[Payments API] DELETE error:", error)
		return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
	}
}

