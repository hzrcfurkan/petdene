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
		const ownerId = searchParams.get("ownerId")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const search = searchParams.get("search") || ""
		const species = searchParams.get("species")
		const skip = (page - 1) * limit

		const where: any = {}

		// Role-based filtering: CUSTOMER can only see their own pets
		if (currentUser.isCustomer) {
			where.ownerId = currentUser.id
		} else if (ownerId && canAccessResource(currentUser.role as any, "STAFF")) {
			// STAFF/ADMIN/SUPER_ADMIN can filter by ownerId
			where.ownerId = ownerId
		}

		// Search filter for name, breed, or species
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ breed: { contains: search, mode: "insensitive" } },
				{ species: { contains: search, mode: "insensitive" } },
			]
		}

		// Species filter
		if (species) {
			where.species = species
		}

		let orderBy: any = { createdAt: "desc" }
		if (sort === "name-asc") {
			orderBy = { name: "asc" }
		} else if (sort === "name-desc") {
			orderBy = { name: "desc" }
		} else if (sort === "date-asc") {
			orderBy = { createdAt: "asc" }
		} else if (sort === "date-desc") {
			orderBy = { createdAt: "desc" }
		}

		const [pets, total] = await Promise.all([
			prisma.pet.findMany({
				where,
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
					_count: {
						select: {
							appointments: true,
							vaccinations: true,
							medicalLogs: true,
							prescriptions: true,
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.pet.count({ where }),
		])

		return NextResponse.json({
			pets,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[Pets API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

		// Validation
		if (!name || !species) {
			return NextResponse.json(
				{ error: "Name and species are required" },
				{ status: 400 }
			)
		}

		// Determine ownerId: CUSTOMER can only create pets for themselves
		let finalOwnerId = ownerId
		if (currentUser.isCustomer) {
			finalOwnerId = currentUser.id
		} else if (ownerId && canAccessResource(currentUser.role as any, "STAFF")) {
			// STAFF/ADMIN/SUPER_ADMIN can create pets for any owner
			// Verify owner exists
			const owner = await prisma.user.findUnique({
				where: { id: ownerId },
			})
			if (!owner) {
				return NextResponse.json({ error: "Owner not found" }, { status: 404 })
			}
		} else {
			finalOwnerId = currentUser.id
		}

		// Create pet
		const newPet = await prisma.pet.create({
			data: {
				name,
				species,
				breed: breed || null,
				gender: gender || null,
				age: age ? Number.parseInt(age) : null,
				dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
				weight: weight ? Number.parseFloat(weight) : null,
				color: color || null,
				image: image || null,
				notes: notes || null,
				ownerId: finalOwnerId,
			},
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

		return NextResponse.json(newPet, { status: 201 })
	} catch (error) {
		console.error("[Pets API] POST error:", error)
		return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
	}
}

