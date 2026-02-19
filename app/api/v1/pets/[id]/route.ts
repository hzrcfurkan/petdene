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

		const pet = await prisma.pet.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				species: true,
				breed: true,
				gender: true,
				age: true,
				dateOfBirth: true,
				weight: true,
				color: true,
				image: true,
				notes: true,
				ownerId: true,
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				createdAt: true,
				updatedAt: true,
				vaccinations: {
					orderBy: { dateGiven: "desc" },
					take: 10,
				},
				medicalLogs: {
					orderBy: { date: "desc" },
					take: 10,
				},
				prescriptions: {
					orderBy: { dateIssued: "desc" },
					take: 10,
				},
				appointments: {
					orderBy: { date: "desc" },
					take: 10,
					select: {
						id: true,
						date: true,
						status: true,
						service: {
							select: {
								id: true,
								title: true,
								type: true,
							},
						},
					},
				},
				_count: {
					select: {
						appointments: true,
						vaccinations: true,
						medicalLogs: true,
						prescriptions: true,
					},
				},
			},
		})

		if (!pet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		// Role-based access: CUSTOMER can only see their own pets
		if (currentUser.isCustomer && pet.ownerId !== currentUser.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		return NextResponse.json(pet)
	} catch (error) {
		console.error("[Pets API] GET by ID error:", error)
		return NextResponse.json({ error: "Failed to fetch pet" }, { status: 500 })
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

		// Check if pet exists
		const existingPet = await prisma.pet.findUnique({
			where: { id },
		})

		if (!existingPet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		// Role-based access: CUSTOMER can only update their own pets
		if (currentUser.isCustomer && existingPet.ownerId !== currentUser.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const body = await req.json()
		const {
			name,
			species,
			breed,
			gender,
			age,
			dateOfBirth,
			weight,
			color,
			image,
			notes,
			ownerId,
		} = body

		// Prepare update data
		const updateData: any = {}
		if (name !== undefined) updateData.name = name
		if (species !== undefined) updateData.species = species
		if (breed !== undefined) updateData.breed = breed || null
		if (gender !== undefined) updateData.gender = gender || null
		if (age !== undefined) updateData.age = age ? Number.parseInt(age) : null
		if (dateOfBirth !== undefined)
			updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
		if (weight !== undefined)
			updateData.weight = weight ? Number.parseFloat(weight) : null
		if (color !== undefined) updateData.color = color || null
		if (image !== undefined) updateData.image = image || null
		if (notes !== undefined) updateData.notes = notes || null

		// Only STAFF/ADMIN/SUPER_ADMIN can change owner
		if (ownerId && canAccessResource(currentUser.role as any, "STAFF")) {
			const owner = await prisma.user.findUnique({
				where: { id: ownerId },
			})
			if (!owner) {
				return NextResponse.json({ error: "Owner not found" }, { status: 404 })
			}
			updateData.ownerId = ownerId
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const updatedPet = await prisma.pet.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				name: true,
				species: true,
				breed: true,
				gender: true,
				age: true,
				dateOfBirth: true,
				weight: true,
				color: true,
				image: true,
				notes: true,
				ownerId: true,
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				createdAt: true,
				updatedAt: true,
			},
		})

		return NextResponse.json(updatedPet)
	} catch (error) {
		console.error("[Pets API] PUT error:", error)
		return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
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

		// Check if pet exists
		const existingPet = await prisma.pet.findUnique({
			where: { id },
		})

		if (!existingPet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		// Role-based access: CUSTOMER can only delete their own pets
		// STAFF/ADMIN/SUPER_ADMIN can delete any pet
		if (currentUser.isCustomer && existingPet.ownerId !== currentUser.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		// Check if pet has appointments (optional: prevent deletion if has active appointments)
		const activeAppointments = await prisma.appointment.findFirst({
			where: {
				petId: id,
				status: {
					in: ["PENDING", "CONFIRMED"],
				},
			},
		})

		if (activeAppointments && currentUser.isCustomer) {
			return NextResponse.json(
				{
					error:
						"Cannot delete pet with active appointments. Please cancel appointments first.",
				},
				{ status: 400 }
			)
		}

		// Delete pet (cascade will handle related records)
		await prisma.pet.delete({
			where: { id },
		})

		return NextResponse.json({ message: "Pet deleted successfully" })
	} catch (error) {
		console.error("[Pets API] DELETE error:", error)
		return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 })
	}
}

