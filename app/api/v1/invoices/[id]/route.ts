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

		const invoice = await prisma.invoice.findUnique({
			where: { id },
			select: {
				id: true,
				appointmentId: true,
				amount: true,
				status: true,
				createdAt: true,
				appointment: {
					select: {
						id: true,
						date: true,
						status: true,
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
						service: {
							select: {
								id: true,
								title: true,
								price: true,
							},
						},
					},
				},
				payment: {
					select: {
						id: true,
						method: true,
						amount: true,
						paidAt: true,
						transactionId: true,
						status: true,
					},
				},
			},
		})

		if (!invoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
		}

		// Sync invoice status with payment status if payment is completed but invoice is not paid
		if (invoice.payment && invoice.payment.status === "COMPLETED" && invoice.status !== "PAID") {
			await prisma.invoice.update({
				where: { id },
				data: { status: "PAID" },
			})
			invoice.status = "PAID"
		}

		if (
			currentUser.isCustomer &&
			invoice.appointment?.pet.ownerId !== currentUser.id
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		return NextResponse.json(invoice)
	} catch (error) {
		console.error("[Invoices API] GET by ID error:", error)
		return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
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

		const existingInvoice = await prisma.invoice.findUnique({
			where: { id },
			select: {
				id: true,
				status: true,
				payment: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!existingInvoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
		}

		const body = await req.json()
		const { amount, status } = body

		const updateData: any = {}

		if (amount !== undefined) {
			if (amount < 0) {
				return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
			}
			updateData.amount = amount
		}

		if (status !== undefined) {
			const validStatuses = ["UNPAID", "PAID", "CANCELLED"]
			if (!validStatuses.includes(status)) {
				return NextResponse.json(
					{ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
					{ status: 400 }
				)
			}

			if (
				existingInvoice.status === "PAID" &&
				status !== "PAID" &&
				existingInvoice.payment
			) {
				return NextResponse.json(
					{
						error:
							"Cannot change status of a paid invoice with payment record. Please handle refunds separately.",
					},
					{ status: 400 }
				)
			}

			updateData.status = status
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const updatedInvoice = await prisma.invoice.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				appointmentId: true,
				amount: true,
				status: true,
				createdAt: true,
			},
		})

		return NextResponse.json(updatedInvoice)
	} catch (error) {
		console.error("[Invoices API] PUT error:", error)
		return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
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

		const existingInvoice = await prisma.invoice.findUnique({
			where: { id },
			select: {
				id: true,
				status: true,
				payment: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!existingInvoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
		}

		if (existingInvoice.payment) {
			return NextResponse.json(
				{ error: "Cannot delete invoice that has a payment record" },
				{ status: 400 }
			)
		}

		await prisma.invoice.delete({ where: { id } })

		return NextResponse.json({ message: "Invoice deleted successfully" })
	} catch (error) {
		console.error("[Invoices API] DELETE error:", error)
		return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
	}
}

