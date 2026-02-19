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
		const petId = searchParams.get("petId")
		const vaccineName = searchParams.get("vaccineName")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const upcoming = searchParams.get("upcoming") // "true" to only show vaccinations with nextDue in future
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		// Role-based filtering: CUSTOMER can only see vaccinations for their pets
		if (currentUser.role === "CUSTOMER") {
			const pets = await prisma.pet.findMany({
				where: { ownerId: currentUser.id },
				select: { id: true },
			})
			const petIds = pets.map((pet) => pet.id)
			if (petIds.length === 0) {
				return NextResponse.json({
					vaccinations: [],
					pagination: { total: 0, page, limit, pages: 0 },
				})
			}
			where.petId = { in: petIds }
		} else if (petId) {
			where.petId = petId
		}

		if (vaccineName) {
			where.vaccineName = { contains: vaccineName, mode: "insensitive" }
		}

		if (dateFrom || dateTo) {
			where.dateGiven = {}
			if (dateFrom) where.dateGiven.gte = new Date(dateFrom)
			if (dateTo) where.dateGiven.lte = new Date(dateTo)
		}

		if (upcoming === "true") {
			where.nextDue = { not: null, gte: new Date() }
		}

		let orderBy: any = { dateGiven: "desc" }
		if (sort === "date-asc") orderBy = { dateGiven: "asc" }
		else if (sort === "date-desc") orderBy = { dateGiven: "desc" }
		else if (sort === "nextdue-asc") orderBy = { nextDue: "asc" }
		else if (sort === "nextdue-desc") orderBy = { nextDue: "desc" }

		const [vaccinations, total] = await Promise.all([
			prisma.vaccination.findMany({
				where,
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
							owner: {
								select: { id: true, name: true, email: true },
							},
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.vaccination.count({ where }),
		])

		return NextResponse.json({
			vaccinations,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[Vaccinations API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch vaccinations" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const body = await req.json()
		const { petId, vaccineName, dateGiven, nextDue, notes } = body

		if (!petId || !vaccineName || !dateGiven) {
			return NextResponse.json(
				{ error: "Pet ID, vaccine name, and date given are required" },
				{ status: 400 }
			)
		}

		const pet = await prisma.pet.findUnique({ where: { id: petId } })
		if (!pet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		const dateGivenValue = new Date(dateGiven)
		if (Number.isNaN(dateGivenValue.getTime())) {
			return NextResponse.json({ error: "Invalid dateGiven value" }, { status: 400 })
		}

		let nextDueValue: Date | null = null
		if (nextDue) {
			nextDueValue = new Date(nextDue)
			if (Number.isNaN(nextDueValue.getTime())) {
				return NextResponse.json({ error: "Invalid nextDue value" }, { status: 400 })
			}
		}

		const vaccination = await prisma.vaccination.create({
			data: {
				petId,
				vaccineName,
				dateGiven: dateGivenValue,
				nextDue: nextDueValue,
				notes: notes || null,
			},
			select: {
				id: true,
				petId: true,
				vaccineName: true,
				dateGiven: true,
				nextDue: true,
				notes: true,
				pet: { select: { id: true, name: true, species: true } },
			},
		})

		return NextResponse.json(vaccination, { status: 201 })
	} catch (error) {
		console.error("[Vaccinations API] POST error:", error)
		return NextResponse.json({ error: "Failed to create vaccination" }, { status: 500 })
	}
}

