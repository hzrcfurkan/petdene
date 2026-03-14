import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (currentUser.isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

		const { searchParams } = new URL(req.url)
		const search   = searchParams.get("search") || ""
		const category = searchParams.get("category") || ""
		const page     = parseInt(searchParams.get("page") || "1")
		const limit    = parseInt(searchParams.get("limit") || "50")
		const skip     = (page - 1) * limit

		const where: any = { isActive: true }
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ barcode: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			]
		}
		if (category && category !== "Tümü") where.category = category

		const [items, total] = await Promise.all([
			prisma.stockItem.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
			prisma.stockItem.count({ where }),
		])

		return NextResponse.json({ items, pagination: { total, page, limit, pages: Math.ceil(total / limit) } })
	} catch (error) {
		console.error("[Stocks GET]", error)
		return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (currentUser.isCustomer)
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })

		const body = await req.json()
		const { name, category, unit, quantity, minQuantity, price, costPrice, description, barcode } = body

		if (!name?.trim()) return NextResponse.json({ error: "Stok adı zorunlu" }, { status: 400 })

		const item = await prisma.stockItem.create({
			data: {
				name: name.trim(),
				category: category || "İlaç",
				unit: unit || "Adet",
				quantity: Number(quantity) || 0,
				minQuantity: Number(minQuantity) || 5,
				price: Number(price) || 0,
				costPrice: Number(costPrice) || 0,
				description: description || null,
				barcode: barcode || null,
			},
		})

		return NextResponse.json(item, { status: 201 })
	} catch (error) {
		console.error("[Stocks POST]", error)
		return NextResponse.json({ error: "Failed to create stock item" }, { status: 500 })
	}
}
