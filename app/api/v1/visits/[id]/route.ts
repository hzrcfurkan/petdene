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

		const visit = await prisma.visit.findUnique({
			where: { id },
			select: {
				id: true,
				protocolNumber: true,
				petId: true,
				appointmentId: true,
				staffId: true,
				visitDate: true,
				status: true,
				totalAmount: true,
				paidAmount: true,
				notes: true,
				createdAt: true,
				updatedAt: true,
				pet: {
					select: {
						id: true,
						patientNumber: true,
						name: true,
						species: true,
						breed: true,
						owner: {
							select: { id: true, name: true, email: true, phone: true },
						},
					},
				},
				staff: { select: { id: true, name: true, email: true } },
				services: {
					select: {
						id: true,
						serviceId: true,
						quantity: true,
						unitPrice: true,
						total: true,
						notes: true,
						service: {
							select: { id: true, title: true, type: true, price: true },
						},
					},
				},
				medicalRecord: true,
				payments: {
					orderBy: { paidAt: "desc" },
					select: {
						id: true,
						method: true,
						amount: true,
						status: true,
						paidAt: true,
						notes: true,
					},
				},
			},
		})

		if (!visit) {
			return NextResponse.json({ error: "Visit not found" }, { status: 404 })
		}

		if (currentUser.isCustomer && visit.pet.owner.id !== currentUser.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		return NextResponse.json(visit)
	} catch (error) {
		console.error("[Visits API] GET by ID error:", error)
		return NextResponse.json({ error: "Failed to fetch visit" }, { status: 500 })
	}
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser || !canAccessResource(currentUser.role as any, "Personel")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const body = await req.json()
		const { status, staffId, visitDate, notes } = body

		const updateData: any = {}
		if (status !== undefined) updateData.status = status
		if (staffId !== undefined) updateData.staffId = staffId || null
		if (visitDate !== undefined) updateData.visitDate = new Date(visitDate)
		if (notes !== undefined) updateData.notes = notes

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const visit = await prisma.visit.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				protocolNumber: true,
				petId: true,
				visitDate: true,
				status: true,
				totalAmount: true,
				paidAmount: true,
				notes: true,
				pet: {
					select: {
						id: true,
						patientNumber: true,
						name: true,
						species: true,
						owner: {
							select: { id: true, name: true, email: true },
						},
					},
				},
				staff: { select: { id: true, name: true, email: true } },
			},
		})

		return NextResponse.json(visit)
	} catch (error) {
		console.error("[Visits API] PATCH error:", error)
		return NextResponse.json({ error: "Failed to update visit" }, { status: 500 })
	}
}
