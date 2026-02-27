import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const appointmentId = searchParams.get("appointmentId")
		const status = searchParams.get("status")
		const ownerId = searchParams.get("ownerId")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		// Customers only see invoices for their pets (appointment or visit)
		if (currentUser.isCustomer) {
			where.OR = [
				{ appointment: { pet: { ownerId: currentUser.id } } },
				{ visit: { pet: { ownerId: currentUser.id } } },
			]
		} else if (ownerId) {
			// Staff/Admin can filter by owner
			where.OR = [
				{ appointment: { pet: { ownerId } } },
				{ visit: { pet: { ownerId } } },
			]
		}

		if (appointmentId) {
			where.appointmentId = appointmentId
		}

		if (status) {
			where.status = status
		}

		if (dateFrom || dateTo) {
			where.createdAt = {}
			if (dateFrom) where.createdAt.gte = new Date(dateFrom)
			if (dateTo) where.createdAt.lte = new Date(dateTo)
		}

		let orderBy: any = { createdAt: "desc" }
		if (sort === "date-asc") orderBy = { createdAt: "asc" }
		else if (sort === "date-desc") orderBy = { createdAt: "desc" }
		else if (sort === "amount-asc") orderBy = { amount: "asc" }
		else if (sort === "amount-desc") orderBy = { amount: "desc" }

		const [invoices, total] = await Promise.all([
			prisma.invoice.findMany({
				where,
				select: {
					id: true,
					appointmentId: true,
					visitId: true,
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
					visit: {
						select: {
							id: true,
							protocolNumber: true,
							visitDate: true,
							status: true,
							totalAmount: true,
							pet: {
								select: {
									id: true,
									name: true,
									species: true,
									owner: {
										select: {
											id: true,
											name: true,
											email: true,
										},
									},
								},
							},
							services: {
								select: {
									id: true,
									quantity: true,
									unitPrice: true,
									total: true,
									service: {
										select: {
											id: true,
											title: true,
											price: true,
										},
									},
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
							status: true,
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
		prisma.invoice.count({ where }),
	])

	// Sync invoice statuses with payment statuses
	const syncPromises = invoices.map(async (invoice) => {
		if (invoice.payment && invoice.payment.status === "COMPLETED" && invoice.status !== "PAID") {
			await prisma.invoice.update({
				where: { id: invoice.id },
				data: { status: "PAID" },
			})
			invoice.status = "PAID"
		}
	})
	await Promise.all(syncPromises)

	return NextResponse.json({
		invoices,
		pagination: {
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		},
	})
	} catch (error) {
		console.error("[Invoices API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const body = await req.json()
		const { appointmentId, visitId, amount, status } = body

		// Must have either appointmentId or visitId (protocol-based)
		if (!appointmentId && !visitId) {
			return NextResponse.json(
				{ error: "Either appointment ID or visit ID (protocol) is required" },
				{ status: 400 }
			)
		}
		if (appointmentId && visitId) {
			return NextResponse.json(
				{ error: "Provide either appointment ID or visit ID, not both" },
				{ status: 400 }
			)
		}
		if (amount === undefined) {
			return NextResponse.json(
				{ error: "Amount is required" },
				{ status: 400 }
			)
		}

		if (amount < 0) {
			return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
		}

		const validStatuses = ["UNPAID", "PAID", "CANCELLED"]
		if (status && !validStatuses.includes(status)) {
			return NextResponse.json(
				{ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
				{ status: 400 }
			)
		}

		if (visitId) {
			// Create invoice from Visit (protocol)
			const visit = await prisma.visit.findUnique({
				where: { id: visitId },
				select: {
					id: true,
					totalAmount: true,
					pet: { select: { ownerId: true } },
				},
			})

			if (!visit) {
				return NextResponse.json({ error: "Visit (protocol) not found" }, { status: 404 })
			}

			const existingInvoice = await prisma.invoice.findUnique({
				where: { visitId },
			})

			if (existingInvoice) {
				return NextResponse.json(
					{ error: "Invoice already exists for this protocol (visit)" },
					{ status: 400 }
				)
			}

			const invoice = await prisma.invoice.create({
				data: {
					visitId,
					amount,
					status: status || "UNPAID",
				},
				select: {
					id: true,
					appointmentId: true,
					visitId: true,
					amount: true,
					status: true,
					createdAt: true,
					visit: {
						select: {
							id: true,
							protocolNumber: true,
							visitDate: true,
							status: true,
							totalAmount: true,
							pet: {
								select: {
									id: true,
									name: true,
									species: true,
									owner: {
										select: { id: true, name: true, email: true },
									},
								},
							},
							services: {
								select: {
									service: {
										select: { id: true, title: true, price: true },
									},
								},
							},
						},
					},
				},
			})

			return NextResponse.json(invoice, { status: 201 })
		}

		// Create invoice from Appointment (legacy)
		const appointment = await prisma.appointment.findUnique({
			where: { id: appointmentId },
			select: {
				id: true,
				service: { select: { price: true } },
				pet: { select: { ownerId: true } },
			},
		})

		if (!appointment) {
			return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
		}

		const existingInvoice = await prisma.invoice.findUnique({
			where: { appointmentId },
		})

		if (existingInvoice) {
			return NextResponse.json(
				{ error: "Invoice already exists for this appointment" },
				{ status: 400 }
			)
		}

		const invoice = await prisma.invoice.create({
			data: {
				appointmentId,
				amount,
				status: status || "UNPAID",
			},
			select: {
				id: true,
				appointmentId: true,
				visitId: true,
				amount: true,
				status: true,
				createdAt: true,
			},
		})

		return NextResponse.json(invoice, { status: 201 })
	} catch (error) {
		console.error("[Invoices API] POST error:", error)
		return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
	}
}

