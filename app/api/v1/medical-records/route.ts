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
		const title = searchParams.get("title")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		// Role-based filtering: CUSTOMER can only see medical records for their pets
		if (currentUser.role === "CUSTOMER") {
			const pets = await prisma.pet.findMany({
				where: { ownerId: currentUser.id },
				select: { id: true },
			})
			const petIds = pets.map((pet) => pet.id)
			if (petIds.length === 0) {
				return NextResponse.json({
					records: [],
					pagination: { total: 0, page, limit, pages: 0 },
				})
			}
			where.petId = { in: petIds }
		} else if (petId) {
			where.petId = petId
		}

		if (title) {
			where.title = { contains: title, mode: "insensitive" }
		}

		if (dateFrom || dateTo) {
			where.date = {}
			if (dateFrom) where.date.gte = new Date(dateFrom)
			if (dateTo) where.date.lte = new Date(dateTo)
		}

		let orderBy: any = { date: "desc" }
		if (sort === "date-asc") orderBy = { date: "asc" }
		else if (sort === "date-desc") orderBy = { date: "desc" }

		const [records, total] = await Promise.all([
			prisma.medicalRecord.findMany({
				where,
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
							owner: { select: { id: true, name: true, email: true } },
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.medicalRecord.count({ where }),
		])

		return NextResponse.json({
			records,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[MedicalRecords API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 })
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
		const { petId, title, description, diagnosis, treatment, date } = body

		if (!petId || !title) {
			return NextResponse.json(
				{ error: "Pet ID and title are required" },
				{ status: 400 }
			)
		}

		const pet = await prisma.pet.findUnique({ where: { id: petId } })
		if (!pet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		const dateValue = date ? new Date(date) : new Date()
		if (Number.isNaN(dateValue.getTime())) {
			return NextResponse.json({ error: "Invalid date value" }, { status: 400 })
		}

		const record = await prisma.medicalRecord.create({
			data: {
				petId,
				title,
				description: description || null,
				diagnosis: diagnosis || null,
				treatment: treatment || null,
				date: dateValue,
			},
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

		return NextResponse.json(record, { status: 201 })
	} catch (error) {
		console.error("[MedicalRecords API] POST error:", error)
		return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 })
	}
}

