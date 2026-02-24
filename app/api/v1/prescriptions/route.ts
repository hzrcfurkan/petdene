import { canAccessResource, currentUserServer, hasPermission } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()

		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const petId = searchParams.get("petId")
		const issuedById = searchParams.get("issuedById")
		const medicineName = searchParams.get("medicineName")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		// Role-based filtering: CUSTOMER can only see prescriptions for their pets
		if (currentUser.isCustomer) {
			// Get all pet IDs owned by this customer
			const userPets = await prisma.pet.findMany({
				where: { ownerId: currentUser.id },
				select: { id: true },
			})
			const petIds = userPets.map((pet) => pet.id)
			if (petIds.length === 0) {
				// No pets, return empty result
				return NextResponse.json({
					prescriptions: [],
					pagination: {
						total: 0,
						page,
						limit,
						pages: 0,
					},
				})
			}
			where.petId = { in: petIds }
		} else {
			// STAFF/ADMIN/SUPER_ADMIN can filter by petId
			if (petId) {
				where.petId = petId
			}
		}

		// Additional filters
		if (issuedById && canAccessResource(currentUser.role as any, "STAFF")) {
			where.issuedById = issuedById
		}
		if (medicineName) {
			where.medicineName = { contains: medicineName, mode: "insensitive" }
		}

		// Date range filtering
		if (dateFrom || dateTo) {
			where.dateIssued = {}
			if (dateFrom) {
				where.dateIssued.gte = new Date(dateFrom)
			}
			if (dateTo) {
				where.dateIssued.lte = new Date(dateTo)
			}
		}

		let orderBy: any = { dateIssued: "desc" }
		if (sort === "date-asc") {
			orderBy = { dateIssued: "asc" }
		} else if (sort === "date-desc") {
			orderBy = { dateIssued: "desc" }
		} else if (sort === "medicine-asc") {
			orderBy = { medicineName: "asc" }
		} else if (sort === "medicine-desc") {
			orderBy = { medicineName: "desc" }
		}

		const [prescriptions, total] = await Promise.all([
			prisma.prescription.findMany({
				where,
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
				orderBy,
				skip,
				take: limit,
			}),
			prisma.prescription.count({ where }),
		])

		return NextResponse.json({
			prescriptions,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[Prescriptions API] GET error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch prescriptions" },
			{ status: 500 }
		)
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Only STAFF, ADMIN, and SUPER_ADMIN can create prescriptions
		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json(
				{ error: "Only staff members can create prescriptions" },
				{ status: 403 }
			)
		}

		const body = await req.json()
		const { petId, medicineName, dosage, instructions, dateIssued } = body

		// Validation
		if (!petId || !medicineName) {
			return NextResponse.json(
				{ error: "Pet ID and medicine name are required" },
				{ status: 400 }
			)
		}

		// Verify pet exists
		const pet = await prisma.pet.findUnique({
			where: { id: petId },
			select: { id: true },
		})

		if (!pet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		// Create prescription (issuedById is automatically set to current user)
		const newPrescription = await prisma.prescription.create({
			data: {
				petId,
				issuedById: currentUser.id,
				medicineName,
				dosage: dosage || null,
				instructions: instructions || null,
				dateIssued: dateIssued ? new Date(dateIssued) : new Date(),
			},
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

		return NextResponse.json(newPrescription, { status: 201 })
	} catch (error) {
		console.error("[Prescriptions API] POST error:", error)
		return NextResponse.json(
			{ error: "Failed to create prescription" },
			{ status: 500 }
		)
	}
}

