import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; serviceId: string }> }
) {
	try {
		const { id: visitId, serviceId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const visitService = await prisma.visitService.findFirst({
			where: { visitId, id: serviceId },
			select: { id: true, total: true, visit: { select: { status: true } } },
		})
		if (!visitService) {
			return NextResponse.json({ error: "Visit service not found" }, { status: 404 })
		}
		if (visitService.visit.status === "CANCELLED") {
			return NextResponse.json(
				{ error: "Cannot remove services from cancelled visit" },
				{ status: 400 }
			)
		}

		await prisma.$transaction([
			prisma.visitService.delete({
				where: { id: serviceId },
			}),
			prisma.visit.update({
				where: { id: visitId },
				data: {
					totalAmount: { decrement: visitService.total },
				},
			}),
		])

		return NextResponse.json({ message: "Service removed" })
	} catch (error) {
		console.error("[Visit Services API] DELETE error:", error)
		return NextResponse.json({ error: "Failed to remove service" }, { status: 500 })
	}
}
