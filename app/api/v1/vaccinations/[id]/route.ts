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

		const vaccination = await prisma.vaccination.findUnique({
			where: { id },
			select: {
				id: true,
				petId: true,
				vaccineName: true,
				dateGiven: true,
				nextDue: true,
				notes: true,
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

		if (!vaccination) {
			return NextResponse.json({ error: "Vaccination not found" }, { status: 404 })
		}

		// Role-based access: CUSTOMER can only see vaccinations for their pets
		if (currentUser.role === "CUSTOMER") {
			if (vaccination.pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}
		}

		return NextResponse.json(vaccination)
	} catch (error) {
		console.error("[Vaccinations API] GET by ID error:", error)
		return NextResponse.json({ error: "Failed to fetch vaccination" }, { status: 500 })
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

		const existing = await prisma.vaccination.findUnique({
			where: { id },
			select: { id: true },
		})

		if (!existing) {
			return NextResponse.json({ error: "Vaccination not found" }, { status: 404 })
		}

		const body = await req.json()
		const { petId, vaccineName, dateGiven, nextDue, notes } = body

		const updateData: any = {}

		if (petId !== undefined) {
			const pet = await prisma.pet.findUnique({ where: { id: petId } })
			if (!pet) {
				return NextResponse.json({ error: "Pet not found" }, { status: 404 })
			}
			updateData.petId = petId
		}

		if (vaccineName !== undefined) updateData.vaccineName = vaccineName

		if (dateGiven !== undefined) {
			const dateValue = new Date(dateGiven)
			if (Number.isNaN(dateValue.getTime())) {
				return NextResponse.json({ error: "Invalid dateGiven value" }, { status: 400 })
			}
			updateData.dateGiven = dateValue
		}

		if (nextDue !== undefined) {
			if (!nextDue) {
				updateData.nextDue = null
			} else {
				const nextDueValue = new Date(nextDue)
				if (Number.isNaN(nextDueValue.getTime())) {
					return NextResponse.json({ error: "Invalid nextDue value" }, { status: 400 })
				}
				updateData.nextDue = nextDueValue
			}
		}

		if (notes !== undefined) updateData.notes = notes || null

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const updated = await prisma.vaccination.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				petId: true,
				vaccineName: true,
				dateGiven: true,
				nextDue: true,
				notes: true,
			},
		})

		return NextResponse.json(updated)
	} catch (error) {
		console.error("[Vaccinations API] PUT error:", error)
		return NextResponse.json({ error: "Failed to update vaccination" }, { status: 500 })
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

		const existing = await prisma.vaccination.findUnique({
			where: { id },
			select: { id: true },
		})

		if (!existing) {
			return NextResponse.json({ error: "Vaccination not found" }, { status: 404 })
		}

		await prisma.vaccination.delete({ where: { id } })

		return NextResponse.json({ message: "Vaccination deleted successfully" })
	} catch (error) {
		console.error("[Vaccinations API] DELETE error:", error)
		return NextResponse.json({ error: "Failed to delete vaccination" }, { status: 500 })
	}
}

