import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  try {

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe key missing" },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

    const currentUser = await currentUserServer()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    ...

// Confirm payment completion and update invoice status
export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { paymentIntentId, invoiceId } = body

		if (!paymentIntentId || !invoiceId) {
			return NextResponse.json(
				{ error: "Payment Intent ID and Invoice ID are required" },
				{ status: 400 }
			)
		}

		// Verify payment intent with Stripe
		let paymentIntent
		try {
			paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
		} catch (error) {
			return NextResponse.json({ error: "Invalid payment intent" }, { status: 400 })
		}

		// Only proceed if payment succeeded
		if (paymentIntent.status !== "succeeded") {
			return NextResponse.json(
				{ error: `Payment intent status is ${paymentIntent.status}, not succeeded` },
				{ status: 400 }
			)
		}

		// Find payment record
		const payment = await prisma.payment.findFirst({
			where: {
				stripePaymentIntentId: paymentIntentId,
				invoiceId: invoiceId,
			},
			select: {
				id: true,
				status: true,
				invoice: {
					select: {
						id: true,
						status: true,
					},
				},
			},
		})

		if (!payment) {
			return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
		}

		// Check if already completed
		if (payment.status === "COMPLETED" && payment.invoice.status === "PAID") {
			return NextResponse.json({ message: "Payment already confirmed" })
		}

		// Update payment and invoice in a transaction
		await prisma.$transaction([
			prisma.payment.update({
				where: { id: payment.id },
				data: {
					status: "COMPLETED",
					paidAt: new Date(),
					transactionId: paymentIntentId,
				},
			}),
			prisma.invoice.update({
				where: { id: invoiceId },
				data: {
					status: "PAID",
				},
			}),
		])

		return NextResponse.json({ message: "Payment confirmed successfully" })
	} catch (error: any) {
		console.error("[Payment Confirm API] Error:", error)
		return NextResponse.json(
			{ error: error.message || "Failed to confirm payment" },
			{ status: 500 }
		)
	}
}

