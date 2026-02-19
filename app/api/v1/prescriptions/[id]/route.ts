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

		const prescription = await prisma.prescription.findUnique({
			where: { id },
			select: {
				id: true,
				petId: true,
				issuedById: true,
				medicineName: true,
				dosage: true,
				instructions: true,
				dateIssued: true,
				pet: {
					select: {
						id: true,
						name: true,
						species: true,
						breed: true,
						gender: true,
						age: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
								phone: true,
							},
						},
					},
				},
				issuedBy: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
			},
		})

		if (!prescription) {
			return NextResponse.json(
				{ error: "Prescription not found" },
				{ status: 404 }
			)
		}

		// Role-based access: CUSTOMER can only see prescriptions for their pets
		if (currentUser.isCustomer) {
			const pet = await prisma.pet.findUnique({
				where: { id: prescription.petId },
				select: { ownerId: true },
			})

			if (!pet || pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}
		}

		return NextResponse.json(prescription)
	} catch (error) {
		console.error("[Prescriptions API] GET by ID error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch prescription" },
			{ status: 500 }
		)
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

		// Only STAFF, ADMIN, and SUPER_ADMIN can update prescriptions
		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json(
				{ error: "Only staff members can update prescriptions" },
				{ status: 403 }
			)
		}

		// Check if prescription exists
		const existingPrescription = await prisma.prescription.findUnique({
			where: { id },
		})

		if (!existingPrescription) {
			return NextResponse.json(
				{ error: "Prescription not found" },
				{ status: 404 }
			)
		}

		const body = await req.json()
		const { petId, medicineName, dosage, instructions, dateIssued } = body

		// Prepare update data
		const updateData: any = {}

		if (petId !== undefined) {
			// Verify pet exists
			const pet = await prisma.pet.findUnique({
				where: { id: petId },
			})
			if (!pet) {
				return NextResponse.json({ error: "Pet not found" }, { status: 404 })
			}
			updateData.petId = petId
		}

		if (medicineName !== undefined) {
			updateData.medicineName = medicineName
		}
		if (dosage !== undefined) {
			updateData.dosage = dosage || null
		}
		if (instructions !== undefined) {
			updateData.instructions = instructions || null
		}
		if (dateIssued !== undefined) {
			updateData.dateIssued = new Date(dateIssued)
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 }
			)
		}

		const updatedPrescription = await prisma.prescription.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				petId: true,
				issuedById: true,
				medicineName: true,
				dosage: true,
				instructions: true,
				dateIssued: true,
				pet: {
					select: {
						id: true,
						name: true,
						species: true,
						breed: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				issuedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		})

		return NextResponse.json(updatedPrescription)
	} catch (error) {
		console.error("[Prescriptions API] PUT error:", error)
		return NextResponse.json(
			{ error: "Failed to update prescription" },
			{ status: 500 }
		)
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

		// Only STAFF, ADMIN, and SUPER_ADMIN can delete prescriptions
		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json(
				{ error: "Only staff members can delete prescriptions" },
				{ status: 403 }
			)
		}

		// Check if prescription exists
		const existingPrescription = await prisma.prescription.findUnique({
			where: { id },
		})

		if (!existingPrescription) {
			return NextResponse.json(
				{ error: "Prescription not found" },
				{ status: 404 }
			)
		}

		// Delete prescription
		await prisma.prescription.delete({
			where: { id },
		})

		return NextResponse.json({ message: "Prescription deleted successfully" })
	} catch (error) {
		console.error("[Prescriptions API] DELETE error:", error)
		return NextResponse.json(
			{ error: "Failed to delete prescription" },
			{ status: 500 }
		)
	}
}

