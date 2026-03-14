import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (currentUser.isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

		const body = await req.json()
		const updateData: any = {}
		if (body.name        !== undefined) updateData.name        = body.name
		if (body.category    !== undefined) updateData.category    = body.category
		if (body.unit        !== undefined) updateData.unit        = body.unit
		if (body.quantity    !== undefined) updateData.quantity    = Number(body.quantity)
		if (body.minQuantity !== undefined) updateData.minQuantity = Number(body.minQuantity)
		if (body.price       !== undefined) updateData.price       = Number(body.price)
		if (body.costPrice   !== undefined) updateData.costPrice   = Number(body.costPrice)
		if (body.description !== undefined) updateData.description = body.description
		if (body.barcode     !== undefined) updateData.barcode     = body.barcode
		if (body.isActive    !== undefined) updateData.isActive    = body.isActive

		const item = await prisma.stockItem.update({ where: { id }, data: updateData })
		return NextResponse.json(item)
	} catch (error) {
		console.error("[Stocks PATCH]", error)
		return NextResponse.json({ error: "Failed to update" }, { status: 500 })
	}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		if (currentUser.isCustomer)
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })

		await prisma.stockItem.update({ where: { id }, data: { isActive: false } })
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("[Stocks DELETE]", error)
		return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
	}
}
