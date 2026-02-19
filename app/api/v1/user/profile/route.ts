import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				image: true,
				role: true,
				createdAt: true,
			},
		})

		return NextResponse.json(user)
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { name, phone, image } = body

		const updatedUser = await prisma.user.update({
			where: { id: currentUser.id },
			data: {
				...(name && { name }),
				...(phone && { phone }),
				...(image && { image }),
			},
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				image: true,
			},
		})

		return NextResponse.json(updatedUser)
	} catch (error) {
		return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
	}
}
