import { canAccessResource, currentUserServer, hasPermission } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()

		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const service = await prisma.petService.findUnique({
			where: { id },
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
				appointments: {
					orderBy: { date: "desc" },
					take: 10,
					select: {
						id: true,
						date: true,
						status: true,
						pet: {
							select: {
								id: true,
								name: true,
								species: true,
							},
						},
					},
				},
				_count: {
					select: {
						appointments: true,
					},
				},
			},
		})

		if (!service) {
			return NextResponse.json({ error: "Service not found" }, { status: 404 })
		}

		// CUSTOMER can only see active services
		if (currentUser.isCustomer && !service.active) {
			return NextResponse.json({ error: "Service not found" }, { status: 404 })
		}

		return NextResponse.json(service)
	} catch (error) {
		console.error("[PetServices API] GET by ID error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch service" },
			{ status: 500 }
		)
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()

		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Only ADMIN and SUPER_ADMIN can update services
		if (!hasPermission(currentUser.role as any, "manage_services")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		// Check if service exists
		const existingService = await prisma.petService.findUnique({
			where: { id },
		})

		if (!existingService) {
			return NextResponse.json(
				{ error: "Service not found" },
				{ status: 404 }
			)
		}

		const body = await req.json()
		const { title, type, description, duration, price, image, active } = body

		// Prepare update data
		const updateData: any = {}
		if (title !== undefined) updateData.title = title
		if (type !== undefined) {
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
			updateData.type = type
		}
		if (description !== undefined) updateData.description = description || null
		if (duration !== undefined)
			updateData.duration = duration ? Number.parseInt(duration) : null
		if (price !== undefined) {
			const priceValue = Number.parseFloat(price)
			if (priceValue < 0) {
				return NextResponse.json(
					{ error: "Price must be a positive number" },
					{ status: 400 }
				)
			}
			updateData.price = priceValue
		}
		if (image !== undefined) updateData.image = image || null
		if (active !== undefined) updateData.active = Boolean(active)

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 }
			)
		}

		const updatedService = await prisma.petService.update({
			where: { id },
			data: updateData,
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

		return NextResponse.json(updatedService)
	} catch (error) {
		console.error("[PetServices API] PUT error:", error)
		return NextResponse.json(
			{ error: "Failed to update service" },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()

		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Only ADMIN and SUPER_ADMIN can delete services
		if (!hasPermission(currentUser.role as any, "manage_services")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		// Check if service exists
		const existingService = await prisma.petService.findUnique({
			where: { id },
		})

		if (!existingService) {
			return NextResponse.json(
				{ error: "Service not found" },
				{ status: 404 }
			)
		}

		// Check if service has active appointments
		const activeAppointments = await prisma.appointment.findFirst({
			where: {
				serviceId: id,
				status: {
					in: ["PENDING", "CONFIRMED"],
				},
			},
		})

		if (activeAppointments) {
			return NextResponse.json(
				{
					error:
						"Cannot delete service with active appointments. Please deactivate the service instead or wait for appointments to complete.",
				},
				{ status: 400 }
			)
		}

		// Delete service (cascade will handle related records)
		await prisma.petService.delete({
			where: { id },
		})

		return NextResponse.json({ message: "Service deleted successfully" })
	} catch (error) {
		console.error("[PetServices API] DELETE error:", error)
		return NextResponse.json(
			{ error: "Failed to delete service" },
			{ status: 500 }
		)
	}
}

