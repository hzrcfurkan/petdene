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

		const record = await prisma.medicalRecord.findUnique({
			where: { id },
			select: {
				id: true,
				petId: true,
				title: true,
				description: true,
				diagnosis: true,
				treatment: true,
				date: true,
				pet: {
					select: {
						id: true,
						name: true,
						species: true,
						ownerId: true,
						owner: { select: { id: true, name: true, email: true } },
					},
				},
			},
		})

		if (!record) {
			return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
		}

		// Role-based access: CUSTOMER can only see medical records for their pets
		if (currentUser.role === "CUSTOMER") {
			if (record.pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}
		}

		return NextResponse.json(record)
	} catch (error) {
		console.error("[MedicalRecords API] GET by ID error:", error)
		return NextResponse.json({ error: "Failed to fetch medical record" }, { status: 500 })
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

		if (!canAccessResource(currentUser.role, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const existing = await prisma.medicalRecord.findUnique({ where: { id } })
		if (!existing) {
			return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
		}

		const body = await req.json()
		const { petId, title, description, diagnosis, treatment, date } = body

		const updateData: any = {}

		if (petId !== undefined) {
			const pet = await prisma.pet.findUnique({ where: { id: petId } })
			if (!pet) {
				return NextResponse.json({ error: "Pet not found" }, { status: 404 })
			}
			updateData.petId = petId
		}

		if (title !== undefined) updateData.title = title
		if (description !== undefined) updateData.description = description || null
		if (diagnosis !== undefined) updateData.diagnosis = diagnosis || null
		if (treatment !== undefined) updateData.treatment = treatment || null

		if (date !== undefined) {
			const dateValue = new Date(date)
			if (Number.isNaN(dateValue.getTime())) {
				return NextResponse.json({ error: "Invalid date value" }, { status: 400 })
			}
			updateData.date = dateValue
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const updated = await prisma.medicalRecord.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				petId: true,
				title: true,
				description: true,
				diagnosis: true,
				treatment: true,
				date: true,
			},
		})

		return NextResponse.json(updated)
	} catch (error) {
		console.error("[MedicalRecords API] PUT error:", error)
		return NextResponse.json({ error: "Failed to update medical record" }, { status: 500 })
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

		if (!canAccessResource(currentUser.role, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const existing = await prisma.medicalRecord.findUnique({ where: { id } })
		if (!existing) {
			return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
		}

		await prisma.medicalRecord.delete({ where: { id } })

		return NextResponse.json({ message: "Medical record deleted successfully" })
	} catch (error) {
		console.error("[MedicalRecords API] DELETE error:", error)
		return NextResponse.json({ error: "Failed to delete medical record" }, { status: 500 })
	}
}

