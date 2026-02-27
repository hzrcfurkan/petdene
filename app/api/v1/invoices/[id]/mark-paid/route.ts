import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST: Mark invoice as paid (Admin/SuperAdmin/Staff only).
 * Creates a Payment record and updates invoice status.
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: invoiceId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden. Admin or Staff required." }, { status: 403 })
		}

		const body = await req.json().catch(() => ({}))
		const { method = "cash", notes } = body

		const validMethods = ["cash", "card", "stripe"]
		if (!validMethods.includes(method)) {
			return NextResponse.json(
				{ error: `Invalid method. Must be one of: ${validMethods.join(", ")}` },
				{ status: 400 }
			)
		}

		const invoice = await prisma.invoice.findUnique({
			where: { id: invoiceId },
			select: {
				id: true,
				amount: true,
				status: true,
				payment: { select: { id: true, status: true } },
			},
		})

		if (!invoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
		}

		if (invoice.status === "PAID") {
			return NextResponse.json(
				{ error: "Invoice is already paid" },
				{ status: 400 }
			)
		}

		if (invoice.payment?.status === "COMPLETED") {
			return NextResponse.json(
				{ error: "Payment already completed for this invoice" },
				{ status: 400 }
			)
		}

		// Create Payment (COMPLETED) and update Invoice in one transaction
		await prisma.$transaction(async (tx) => {
			if (invoice.payment) {
				await tx.payment.update({
					where: { id: invoice.payment.id },
					data: {
						method,
						amount: invoice.amount,
						status: "COMPLETED",
						paidAt: new Date(),
					},
				})
			} else {
				await tx.payment.create({
					data: {
						invoiceId,
						method,
						amount: invoice.amount,
						status: "COMPLETED",
						paidAt: new Date(),
					},
				})
			}
			await tx.invoice.update({
				where: { id: invoiceId },
				data: { status: "PAID" },
			})
		})

		const updated = await prisma.invoice.findUnique({
			where: { id: invoiceId },
			select: {
				id: true,
				amount: true,
				status: true,
				payment: {
					select: {
						id: true,
						method: true,
						amount: true,
						status: true,
						paidAt: true,
					},
				},
			},
		})

		return NextResponse.json({
			message: "Invoice marked as paid",
			invoice: updated,
		})
	} catch (error) {
		console.error("[Invoice Mark Paid API] Error:", error)
		return NextResponse.json({ error: "Failed to mark invoice as paid" }, { status: 500 })
	}
}
