import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { generateProtocolNumber } from "@/lib/db/protocol-number"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const petId = searchParams.get("petId")
		const staffId = searchParams.get("staffId")
		const status = searchParams.get("status")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const forInvoice = searchParams.get("forInvoice") === "true"
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		// For invoice creation: only visits without invoice, exclude cancelled
		if (forInvoice) {
			where.invoice = null
			where.status = { not: "İptal Edildi" }
		}

		if (currentUser.isCustomer) {
			const userPets = await prisma.pet.findMany({
				where: { ownerId: currentUser.id },
				select: { id: true },
			})
			const petIds = userPets.map((p) => p.id)
			if (petIds.length === 0) {
				return NextResponse.json({
					visits: [],
					pagination: { total: 0, page, limit, pages: 0 },
				})
			}
			where.petId = { in: petIds }
		} else if (petId) {
			where.petId = petId
		}

		if (staffId && canAccessResource(currentUser.role as any, "STAFF")) {
			where.staffId = staffId
		}
		if (status) where.status = status
		// Date range filtering (inclusive: full start and end day)
		if (dateFrom || dateTo) {
			where.visitDate = {}
			if (dateFrom) where.visitDate.gte = new Date(dateFrom + "T00:00:00.000Z")
			if (dateTo) where.visitDate.lte = new Date(dateTo + "T23:59:59.999Z")
		}

		let orderBy: any = { visitDate: "desc" }
		if (sort === "date-asc") orderBy = { visitDate: "asc" }
		else if (sort === "protocol-asc") orderBy = { protocolNumber: "asc" }
		else if (sort === "protocol-desc") orderBy = { protocolNumber: "desc" }

		const [visits, total] = await Promise.all([
			prisma.visit.findMany({
				where,
				select: {
					id: true,
					protocolNumber: true,
					petId: true,
					visitDate: true,
					status: true,
					totalAmount: true,
					paidAmount: true,
					pet: {
						select: {
							id: true,
							patientNumber: true,
							name: true,
							species: true,
							owner: {
								select: { id: true, name: true, email: true, phone: true },
							},
						},
					},
					staff: {
						select: { id: true, name: true, email: true },
					},
					...(forInvoice
						? {
								services: {
									select: {
										id: true,
										quantity: true,
										unitPrice: true,
										total: true,
										service: {
											select: { id: true, title: true, price: true },
										},
									},
								},
							}
						: {
								_count: {
									select: { services: true, payments: true },
								},
							}),
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.visit.count({ where }),
		])

		return NextResponse.json({
			visits,
			pagination: { total, page, limit, pages: Math.ceil(total / limit) },
		})
	} catch (error) {
		console.error("[Visits API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}
		if (!canAccessResource(currentUser.role as any, "STAFF")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const body = await req.json()
		const { petId, appointmentId, staffId, visitDate, notes } = body

		if (!petId || !visitDate) {
			return NextResponse.json(
				{ error: "Pet ID and visit date are required" },
				{ status: 400 }
			)
		}

		const pet = await prisma.pet.findUnique({
			where: { id: petId },
			select: { id: true, ownerId: true },
		})
		if (!pet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		const protocolNumber = await generateProtocolNumber()

		const visit = await prisma.visit.create({
			data: {
				protocolNumber,
				petId,
				appointmentId: appointmentId || null,
				staffId: staffId || null,
				visitDate: new Date(visitDate),
				notes: notes || null,
			},
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
				pet: {
					select: {
						id: true,
						patientNumber: true,
						name: true,
						species: true,
						owner: {
							select: { id: true, name: true, email: true, phone: true },
						},
					},
				},
				staff: {
					select: { id: true, name: true, email: true },
				},
			},
		})

		return NextResponse.json(visit, { status: 201 })
	} catch (error) {
		console.error("[Visits API] POST error:", error)
		return NextResponse.json({ error: "Ziyaret oluşturulamadı" }, { status: 500 })
	}
}
