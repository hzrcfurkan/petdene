import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2024-12-18.acacia",
})

// Create Stripe Payment Intent
export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { invoiceId } = body

		if (!invoiceId) {
			return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
		}

		// Check if Stripe is configured
		if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
			return NextResponse.json(
				{ error: "Stripe is not configured. Please contact support." },
				{ status: 500 }
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
								name: true,
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
			return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 })
		}

		// Customer can only pay for their own invoices
		if (currentUser.isCustomer && invoice.appointment.pet.ownerId !== currentUser.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		// Check if payment already exists and is completed
		if (invoice.payment) {
			if (invoice.payment.status === "COMPLETED") {
				return NextResponse.json({ error: "Payment already completed for this invoice" }, { status: 400 })
			}
			// If payment exists but is PENDING or FAILED, we can reuse it
		}

		// Create or retrieve payment record with proper error handling for race conditions
		let payment = invoice.payment

		if (!payment) {
			try {
				// Try to create payment record with PENDING status
				payment = await prisma.payment.create({
					data: {
						invoiceId: invoice.id,
						method: "stripe",
						amount: invoice.amount,
						status: "PENDING",
					},
				})
			} catch (error: any) {
				// Handle unique constraint error (race condition)
				if (error.code === "P2002" && error.meta?.target?.includes("invoiceId")) {
					// Payment was created by another request, fetch it with all fields
					payment = await prisma.payment.findUnique({
						where: { invoiceId: invoice.id },
						select: {
							id: true,
							invoiceId: true,
							method: true,
							amount: true,
							status: true,
							stripePaymentIntentId: true,
							stripeClientSecret: true,
							transactionId: true,
							paidAt: true,
							createdAt: true,
							updatedAt: true,
						},
					})
					if (!payment) {
						throw new Error("Failed to create or retrieve payment record")
					}
					// If payment is completed, return error
					if (payment.status === "COMPLETED") {
						return NextResponse.json({ error: "Payment already completed for this invoice" }, { status: 400 })
					}
				} else {
					// Re-throw other errors
					console.error("[Stripe Payment API] Payment creation error:", error)
					throw error
				}
			}
		} else if (payment.status === "FAILED" || payment.status === "CANCELLED") {
			// Reset failed/cancelled payment to PENDING
			try {
				payment = await prisma.payment.update({
					where: { id: payment.id },
					data: {
						status: "PENDING",
						stripePaymentIntentId: null,
						stripeClientSecret: null,
					},
				})
			} catch (error: any) {
				// If update fails, fetch the latest payment state
				payment = await prisma.payment.findUnique({
					where: { id: payment.id },
				})
				if (!payment) {
					throw new Error("Failed to update payment record")
				}
			}
		}

		// If payment already has a Stripe Payment Intent, check its status
		if (payment.stripePaymentIntentId) {
			try {
				const existingIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId)
				
				// If payment already succeeded, update our records and return error
				if (existingIntent.status === "succeeded") {
					// Update payment and invoice status
					await prisma.$transaction([
						prisma.payment.update({
							where: { id: payment.id },
							data: {
								status: "COMPLETED",
								paidAt: new Date(),
								transactionId: existingIntent.id,
							},
						}),
						prisma.invoice.update({
							where: { id: invoice.id },
							data: { status: "PAID" },
						}),
					])
					return NextResponse.json(
						{ error: "Payment already completed for this invoice" },
						{ status: 400 }
					)
				}
				
				// If not canceled, return existing client secret
				if (existingIntent.status !== "canceled") {
					return NextResponse.json({
						clientSecret: existingIntent.client_secret,
						paymentIntentId: existingIntent.id,
						paymentId: payment.id,
					})
				}
			} catch (error) {
				// Payment intent doesn't exist or was canceled, create a new one
			}
		}

		// Create Stripe Payment Intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(invoice.amount * 100), // Convert to cents
			currency: "usd",
			metadata: {
				invoiceId: invoice.id,
				paymentId: payment.id,
				appointmentId: invoice.appointment.id,
				petId: invoice.appointment.pet.id,
				userId: currentUser.id,
			},
			automatic_payment_methods: {
				enabled: true,
			},
		})

		// Update payment record with Stripe Payment Intent ID
		await prisma.payment.update({
			where: { id: payment.id },
			data: {
				stripePaymentIntentId: paymentIntent.id,
				stripeClientSecret: paymentIntent.client_secret,
			},
		})

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			paymentId: payment.id,
		})
	} catch (error: any) {
		console.error("[Stripe Payment API] Error:", error)
		return NextResponse.json(
			{ error: error.message || "Failed to create payment intent" },
			{ status: 500 }
		)
	}
}

// Webhook handler for Stripe events
export async function PUT(req: NextRequest) {
	try {
		const body = await req.text()
		const signature = req.headers.get("stripe-signature")

		if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
			return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
		}

		let event: Stripe.Event

		try {
			event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
		} catch (err: any) {
			console.error("[Stripe Webhook] Signature verification failed:", err.message)
			return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
		}

		// Handle the event
		if (event.type === "payment_intent.succeeded") {
			const paymentIntent = event.data.object as Stripe.PaymentIntent
			const invoiceId = paymentIntent.metadata.invoiceId

			if (invoiceId) {
				// Update payment status
				await prisma.payment.updateMany({
					where: {
						stripePaymentIntentId: paymentIntent.id,
					},
					data: {
						status: "COMPLETED",
						paidAt: new Date(),
						transactionId: paymentIntent.id,
					},
				})

				// Update invoice status
				await prisma.invoice.update({
					where: { id: invoiceId },
					data: { status: "PAID" },
				})
			}
		} else if (event.type === "payment_intent.payment_failed") {
			const paymentIntent = event.data.object as Stripe.PaymentIntent

			await prisma.payment.updateMany({
				where: {
					stripePaymentIntentId: paymentIntent.id,
				},
				data: {
					status: "FAILED",
				},
			})
		} else if (event.type === "payment_intent.canceled") {
			const paymentIntent = event.data.object as Stripe.PaymentIntent

			await prisma.payment.updateMany({
				where: {
					stripePaymentIntentId: paymentIntent.id,
				},
				data: {
					status: "CANCELLED",
				},
			})
		}

		return NextResponse.json({ received: true })
	} catch (error: any) {
		console.error("[Stripe Webhook] Error:", error)
		return NextResponse.json({ error: error.message || "Webhook handler failed" }, { status: 500 })
	}
}

