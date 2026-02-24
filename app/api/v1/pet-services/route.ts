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
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const search = searchParams.get("search") || ""
		const type = searchParams.get("type")
		const active = searchParams.get("active") // "true" | "false" | null
		const skip = (page - 1) * limit

		const where: any = {}

		// CUSTOMER can only see active services
		if (currentUser.isCustomer) {
			where.active = true
		} else if (active !== null) {
			// STAFF/ADMIN/SUPER_ADMIN can filter by active status
			where.active = active === "true"
		}

		// Search filter for title, description, or type
		if (search) {
			where.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
				{ type: { contains: search, mode: "insensitive" } },
			]
		}

		// Type filter
		if (type) {
			where.type = type
		}

		let orderBy: any = { createdAt: "desc" }
		if (sort === "title-asc") {
			orderBy = { title: "asc" }
		} else if (sort === "title-desc") {
			orderBy = { title: "desc" }
		} else if (sort === "price-asc") {
			orderBy = { price: "asc" }
		} else if (sort === "price-desc") {
			orderBy = { price: "desc" }
		} else if (sort === "date-asc") {
			orderBy = { createdAt: "asc" }
		} else if (sort === "date-desc") {
			orderBy = { createdAt: "desc" }
		}

		const [services, total] = await Promise.all([
			prisma.petService.findMany({
				where,
				select: {
					id: true,
					title: true,
					type: true,
					description: true,
					duration: true,
					price: true,
					image: true,
					active: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							appointments: true,
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.petService.count({ where }),
		])

		return NextResponse.json({
			services,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[PetServices API] GET error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch services" },
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

		// Only ADMIN and SUPER_ADMIN can create services
		if (!hasPermission(currentUser.role as any, "manage_services")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const body = await req.json()
		const { title, type, description, duration, price, image, active } = body

		// Validation
		if (!title || !type || price === undefined) {
			return NextResponse.json(
				{ error: "Title, type, and price are required" },
				{ status: 400 }
			)
		}

		if (price < 0) {
			return NextResponse.json(
				{ error: "Price must be a positive number" },
				{ status: 400 }
			)
		}

		// Validate service type
		const validTypes = [
			"grooming",
			"vet-checkup",
			"bath",
			"boarding",
			"training",
		]
		if (!validTypes.includes(type)) {
			return NextResponse.json(
				{
					error: `Invalid service type. Must be one of: ${validTypes.join(", ")}`,
				},
				{ status: 400 }
			)
		}

		// Create service
		const newService = await prisma.petService.create({
			data: {
				title,
				type,
				description: description || null,
				duration: duration ? Number.parseInt(duration) : null,
				price: Number.parseFloat(price),
				image: image || null,
				active: active !== undefined ? Boolean(active) : true,
			},
			select: {
				id: true,
				title: true,
				type: true,
				description: true,
				duration: true,
				price: true,
				image: true,
				active: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		return NextResponse.json(newService, { status: 201 })
	} catch (error) {
		console.error("[PetServices API] POST error:", error)
		return NextResponse.json(
			{ error: "Failed to create service" },
			{ status: 500 }
		)
	}
}

