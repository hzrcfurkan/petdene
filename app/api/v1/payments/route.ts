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
		const invoiceId = searchParams.get("invoiceId")
		const method = searchParams.get("method")
		const minAmount = searchParams.get("minAmount")
		const maxAmount = searchParams.get("maxAmount")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		if (currentUser.isCustomer) {
			where.invoice = {
				appointment: {
					pet: {
						ownerId: currentUser.id,
					},
				},
			}
		} else if (invoiceId) {
			where.invoiceId = invoiceId
		}

		if (method) {
			where.method = method
		}

		if (minAmount || maxAmount) {
			where.amount = {}
			if (minAmount) where.amount.gte = Number.parseFloat(minAmount)
			if (maxAmount) where.amount.lte = Number.parseFloat(maxAmount)
		}

		if (dateFrom || dateTo) {
			where.paidAt = {}
			if (dateFrom) where.paidAt.gte = new Date(dateFrom)
			if (dateTo) where.paidAt.lte = new Date(dateTo)
		}

		let orderBy: any = { paidAt: "desc" }
		if (sort === "date-asc") orderBy = { paidAt: "asc" }
		else if (sort === "date-desc") orderBy = { paidAt: "desc" }
		else if (sort === "amount-asc") orderBy = { amount: "asc" }
		else if (sort === "amount-desc") orderBy = { amount: "desc" }

		const [payments, total] = await Promise.all([
			prisma.payment.findMany({
				where,
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
							amount: true,
							status: true,
							appointment: {
								select: {
									id: true,
									date: true,
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
								},
							},
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.payment.count({ where }),
		])

		return NextResponse.json({
			payments,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[Payments API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { invoiceId, method, transactionId, amount, paidAt } = body

		if (!invoiceId || !method || amount === undefined) {
			return NextResponse.json(
				{ error: "Invoice ID, method, and amount are required" },
				{ status: 400 }
			)
		}

		// Validate payment method
		const validMethods = ["cash", "stripe"]
		if (!validMethods.includes(method)) {
			return NextResponse.json(
				{ error: `Invalid payment method. Must be one of: ${validMethods.join(", ")}` },
				{ status: 400 }
			)
		}

		// Fetch invoice with appointment details
		const invoice = await prisma.invoice.findUnique({
			where: { id: invoiceId },
			select: {
				id: true,
				amount: true,
				status: true,
				appointment: {
					select: {
						id: true,
						pet: {
							select: {
								id: true,
								ownerId: true,
							},
						},
					},
				},
				payment: true,
			},
		})

		if (!invoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
		}

		// Check if invoice is already paid
		if (invoice.status === "PAID") {
			return NextResponse.json(
				{ error: "Invoice is already marked as paid" },
				{ status: 400 }
			)
		}

		// Check if payment already exists
		if (invoice.payment) {
			// If payment is already completed, reject
			if (invoice.payment.status === "COMPLETED") {
				return NextResponse.json(
					{ error: "Payment already completed for this invoice" },
					{ status: 400 }
				)
			}
			
			// If payment is PENDING, FAILED, or CANCELLED, allow updating to cash
			if (method === "cash" && (invoice.payment.status === "PENDING" || invoice.payment.status === "FAILED" || invoice.payment.status === "CANCELLED")) {
				// Update existing payment to cash (keep as PENDING - staff will confirm)
				const updatedPayment = await prisma.payment.update({
					where: { id: invoice.payment.id },
					data: {
						method: "cash",
						amount: invoice.amount,
						status: "PENDING", // Keep as PENDING until staff confirms
						paidAt: null,
						transactionId: null,
						stripePaymentIntentId: null,
						stripeClientSecret: null,
					},
					select: {
						id: true,
						invoiceId: true,
						method: true,
						transactionId: true,
						amount: true,
						paidAt: true,
						status: true,
					},
				})

				// Don't update invoice status - it will be updated when staff/admin confirms
				return NextResponse.json(updatedPayment, { status: 200 })
			}
			
			// For other cases, return error
			return NextResponse.json(
				{ error: "Payment already exists for this invoice. Please complete or cancel the existing payment first." },
				{ status: 400 }
			)
		}

		// Role-based access control
		if (currentUser.isCustomer) {
			// Customers can only pay for their own invoices
			if (invoice.appointment.pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}
			// Customers can only use cash or stripe (not manual entry)
			if (method !== "cash" && method !== "stripe") {
				return NextResponse.json({ error: "Invalid payment method for customer" }, { status: 403 })
			}
		} else {
			// Staff/Admin can create payments with any method
			if (!canAccessResource(currentUser.role as any, "STAFF")) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}
		}

		if (amount < 0) {
			return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
		}

		// Validate amount matches invoice amount (for customers)
		if (currentUser.isCustomer && Math.abs(amount - invoice.amount) > 0.01) {
			return NextResponse.json(
				{ error: `Payment amount must match invoice amount of $${invoice.amount.toFixed(2)}` },
				{ status: 400 }
			)
		}

		// For cash payments, mark as PENDING (staff/admin will confirm later)
		// For stripe, status should be PENDING (handled by webhook)
		// Invoice status will only be updated to PAID when staff/admin confirms the payment
		const paymentStatus = "PENDING"
		const paidAtDate = null // Will be set when payment is confirmed

		const payment = await prisma.payment.create({
			data: {
				invoiceId,
				method,
				transactionId: transactionId || null,
				amount,
				status: paymentStatus,
				paidAt: paidAtDate,
			},
			select: {
				id: true,
				invoiceId: true,
				method: true,
				transactionId: true,
				amount: true,
				paidAt: true,
				status: true,
			},
		})

		// Don't update invoice status here - it will be updated when staff/admin confirms the payment

		return NextResponse.json(payment, { status: 201 })
	} catch (error) {
		console.error("[Payments API] POST error:", error)
		return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
	}
}

