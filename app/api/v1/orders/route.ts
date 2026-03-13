import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

const ORDER_INCLUDE = {
	pet:        { select: { id: true, name: true, species: true, patientNumber: true } },
	visit:      { select: { id: true, protocolNumber: true } },
	orderedBy:  { select: { id: true, name: true, email: true } },
	assignedTo: { select: { id: true, name: true, email: true } },
	stockItem:  { select: { id: true, name: true, unit: true } },
	logs: {
		orderBy: { createdAt: "desc" as const },
		include: { user: { select: { id: true, name: true, email: true } } },
	},
}

// GET /api/v1/orders
export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

		const { searchParams } = new URL(req.url)
		const visitId    = searchParams.get("visitId")
		const petId      = searchParams.get("petId")
		const status     = searchParams.get("status")
		const type       = searchParams.get("type")
		const assignedToId = searchParams.get("assignedToId")
		const priority   = searchParams.get("priority")
		const today      = searchParams.get("today") === "true"
		const page       = parseInt(searchParams.get("page") || "1")
		const limit      = parseInt(searchParams.get("limit") || "50")
		const skip       = (page - 1) * limit

		const where: any = {}

		// Müşteri kendi hayvanlarının orderlarını görebilir
		if (currentUser.isCustomer) {
			const pets = await prisma.pet.findMany({ where: { ownerId: currentUser.id }, select: { id: true } })
			where.petId = { in: pets.map(p => p.id) }
		}

		if (visitId)      where.visitId      = visitId
		if (petId)        where.petId        = petId
		if (status)       where.status       = status
		if (type)         where.type         = type
		if (assignedToId) where.assignedToId = assignedToId
		if (priority)     where.priority     = priority

		// Bugünün orderları
		if (today) {
			const start = new Date(); start.setHours(0, 0, 0, 0)
			const end   = new Date(); end.setHours(23, 59, 59, 999)
			where.OR = [
				{ scheduledAt: { gte: start, lte: end } },
				{ scheduledAt: null, createdAt: { gte: start, lte: end } },
			]
		}

		const [orders, total] = await Promise.all([
			prisma.vetOrder.findMany({
				where,
				include: ORDER_INCLUDE,
				orderBy: [
					{ priority: "asc" },       // URGENT önce
					{ scheduledAt: "asc" },
					{ createdAt: "asc" },
				],
				skip,
				take: limit,
			}),
			prisma.vetOrder.count({ where }),
		])

		return NextResponse.json({
			orders,
			pagination: { total, page, limit, pages: Math.ceil(total / limit) },
		})
	} catch (error) {
		console.error("[orders GET]", error)
		return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
	}
}

// POST /api/v1/orders
export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (!canAccessResource(currentUser.role as any, "STAFF"))
			return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 })

		const body = await req.json()
		const {
			visitId, petId,
			type, title, description,
			stockItemId, dose, route, frequency, duration,
			scheduledAt, priority, assignedToId,
			chargeToVisit, unitPrice,
		} = body

		if (!visitId || !petId || !type || !title)
			return NextResponse.json({ error: "visitId, petId, type ve title zorunludur" }, { status: 400 })

		// Visit var mı?
		const visit = await prisma.visit.findUnique({ where: { id: visitId } })
		if (!visit) return NextResponse.json({ error: "Ziyaret bulunamadı" }, { status: 404 })

		const order = await prisma.vetOrder.create({
			data: {
				visitId,
				petId,
				orderedById:  currentUser.id,
				assignedToId: assignedToId || null,
				type,
				title,
				description:  description || null,
				stockItemId:  stockItemId || null,
				dose:         dose     || null,
				route:        route    || null,
				frequency:    frequency || null,
				duration:     duration || null,
				scheduledAt:  scheduledAt ? new Date(scheduledAt) : null,
				priority:     priority || "NORMAL",
				status:       "PENDING",
				chargeToVisit: chargeToVisit !== false,
				unitPrice:    unitPrice || 0,
				logs: {
					create: {
						userId: currentUser.id,
						action: "CREATED",
						note:   `Order oluşturuldu: ${title}`,
					},
				},
			},
			include: ORDER_INCLUDE,
		})

		return NextResponse.json(order, { status: 201 })
	} catch (error) {
		console.error("[orders POST]", error)
		return NextResponse.json({ error: "Order oluşturulamadı" }, { status: 500 })
	}
}
