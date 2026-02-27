import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Public endpoint - returns active services for guest booking form
 */
export async function GET(req: NextRequest) {
	try {
		const services = await prisma.petService.findMany({
			where: { active: true },
			select: {
				id: true,
				title: true,
				type: true,
				price: true,
				duration: true,
			},
			orderBy: { title: "asc" },
		})
		return NextResponse.json({ services })
	} catch (error) {
		console.error("[Guest Services] Error:", error)
		return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
	}
}
