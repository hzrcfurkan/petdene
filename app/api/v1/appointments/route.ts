import { canAccessResource, currentUserServer, hasPermission } from "@/lib/auth"
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
		const serviceId = searchParams.get("serviceId")
		const staffId = searchParams.get("staffId")
		const status = searchParams.get("status")
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const skip = (page - 1) * limit

		const where: any = {}

		// Role-based filtering: CUSTOMER can only see appointments for their pets
		if (currentUser.isCustomer) {
			// Get all pet IDs owned by this customer
			const userPets = await prisma.pet.findMany({
				where: { ownerId: currentUser.id },
				select: { id: true },
			})
			const petIds = userPets.map((pet) => pet.id)
			if (petIds.length === 0) {
				// No pets, return empty result
				return NextResponse.json({
					appointments: [],
					pagination: {
						total: 0,
						page,
						limit,
						pages: 0,
					},
				})
			}
			where.petId = { in: petIds }
		} else {
			// STAFF/ADMIN/SUPER_ADMIN can filter by petId
			if (petId) {
				where.petId = petId
			}
		}

		// Additional filters
		if (serviceId) {
			where.serviceId = serviceId
		}
		if (staffId && canAccessResource(currentUser.role as any, "STAFF")) {
			where.staffId = staffId
		}
		if (status) {
			where.status = status
		}

		// Date range filtering
		if (dateFrom || dateTo) {
			where.date = {}
			if (dateFrom) {
				where.date.gte = new Date(dateFrom)
			}
			if (dateTo) {
				where.date.lte = new Date(dateTo)
			}
		}

		let orderBy: any = { date: "desc" }
		if (sort === "date-asc") {
			orderBy = { date: "asc" }
		} else if (sort === "date-desc") {
			orderBy = { date: "desc" }
		} else if (sort === "status-asc") {
			orderBy = { status: "asc" }
		} else if (sort === "status-desc") {
			orderBy = { status: "desc" }
		}

		const [appointments, total] = await Promise.all([
			prisma.appointment.findMany({
				where,
				select: {
					id: true,
					petId: true,
					serviceId: true,
					staffId: true,
					date: true,
					status: true,
					notes: true,
					createdAt: true,
					updatedAt: true,
					pet: {
						select: {
							id: true,
							name: true,
							species: true,
							breed: true,
							owner: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
					service: {
						select: {
							id: true,
							title: true,
							type: true,
							price: true,
							duration: true,
						},
					},
					staff: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					invoice: {
						select: {
							id: true,
							amount: true,
							status: true,
						},
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.appointment.count({ where }),
		])

		return NextResponse.json({
			appointments,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[Appointments API] GET error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch appointments" },
			{ status: 500 }
		)
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { petId, serviceId, staffId, date, status, notes } = body

		// Validation
		if (!petId || !serviceId || !date) {
			return NextResponse.json(
				{ error: "Pet ID, service ID, and date are required" },
				{ status: 400 }
			)
		}

		// Verify pet exists
		const pet = await prisma.pet.findUnique({
			where: { id: petId },
			select: { id: true, ownerId: true },
		})

		if (!pet) {
			return NextResponse.json({ error: "Pet not found" }, { status: 404 })
		}

		// CUSTOMER can only create appointments for their own pets
		if (currentUser.isCustomer && pet.ownerId !== currentUser.id) {
			return NextResponse.json(
				{ error: "You can only book appointments for your own pets" },
				{ status: 403 }
			)
		}

		// Verify service exists and is active
		const service = await prisma.petService.findUnique({
			where: { id: serviceId },
			select: { id: true, active: true },
		})

		if (!service) {
			return NextResponse.json({ error: "Service not found" }, { status: 404 })
		}

		if (!service.active) {
			return NextResponse.json(
				{ error: "Service is not available" },
				{ status: 400 }
			)
		}

		// Validate date is in the future (unless admin/staff setting status to COMPLETED)
		const appointmentDate = new Date(date)
		if (appointmentDate < new Date() && status !== "COMPLETED") {
			return NextResponse.json(
				{ error: "Appointment date must be in the future" },
				{ status: 400 }
			)
		}

		// Validate status if provided (only STAFF/ADMIN/SUPER_ADMIN can set status)
		let appointmentStatus = "PENDING"
		if (status !== undefined) {
			if (currentUser.isCustomer) {
				return NextResponse.json(
					{ error: "Customers cannot set appointment status" },
					{ status: 403 }
				)
			}

			const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
			if (!validStatuses.includes(status)) {
				return NextResponse.json(
					{
						error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
					},
					{ status: 400 }
				)
			}
			appointmentStatus = status
		}

		// Verify staff exists if provided (only STAFF/ADMIN/SUPER_ADMIN can assign staff)
		if (staffId) {
			if (!canAccessResource(currentUser.role as any, "STAFF")) {
				return NextResponse.json(
					{ error: "Only staff can assign staff members" },
					{ status: 403 }
				)
			}

			const staff = await prisma.user.findUnique({
				where: { id: staffId },
				select: { id: true, role: true },
			})

			if (!staff) {
				return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
			}

			if (!["STAFF", "ADMIN", "SUPER_ADMIN"].includes(staff.role)) {
				return NextResponse.json(
					{ error: "Assigned user must be staff, admin, or super admin" },
					{ status: 400 }
				)
			}
		}

		// Check for conflicting appointments (same pet at overlapping time)
		// Get service duration or default to 60 minutes
		const serviceDetails = await prisma.petService.findUnique({
			where: { id: serviceId },
			select: { duration: true },
		})

		const durationMinutes = serviceDetails?.duration || 60
		const appointmentEnd = new Date(appointmentDate)
		appointmentEnd.setMinutes(appointmentEnd.getMinutes() + durationMinutes)

		const conflictingAppointment = await prisma.appointment.findFirst({
			where: {
				petId,
				date: {
					gte: appointmentDate,
					lt: appointmentEnd,
				},
				status: {
					in: ["PENDING", "CONFIRMED"],
				},
			},
		})

		if (conflictingAppointment) {
			return NextResponse.json(
				{
					error:
						"Pet already has a conflicting appointment at this time. Please choose a different time.",
				},
				{ status: 400 }
			)
		}

		// Create appointment
		const newAppointment = await prisma.appointment.create({
			data: {
				petId,
				serviceId,
				staffId: staffId || null,
				date: appointmentDate,
				status: appointmentStatus,
				notes: notes || null,
			},
			select: {
				id: true,
				petId: true,
				serviceId: true,
				staffId: true,
				date: true,
				status: true,
				notes: true,
				createdAt: true,
				updatedAt: true,
				pet: {
					select: {
						id: true,
						name: true,
						species: true,
						breed: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				service: {
					select: {
						id: true,
						title: true,
						type: true,
						price: true,
						duration: true,
					},
				},
				staff: staffId
					? {
							select: {
								id: true,
								name: true,
								email: true,
							},
						}
					: undefined,
			},
		})

		// Auto-generate invoice when status is CONFIRMED
		if (appointmentStatus === "CONFIRMED") {
			// Get service price
			const service = await prisma.petService.findUnique({
				where: { id: serviceId },
				select: { price: true },
			})

			if (service) {
				await prisma.invoice.create({
					data: {
						appointmentId: newAppointment.id,
						amount: service.price,
						status: "UNPAID",
					},
				})
			}
		}

		// Fetch the appointment again to include invoice if created
		const appointmentWithInvoice = await prisma.appointment.findUnique({
			where: { id: newAppointment.id },
			select: {
				id: true,
				petId: true,
				serviceId: true,
				staffId: true,
				date: true,
				status: true,
				notes: true,
				createdAt: true,
				updatedAt: true,
				pet: {
					select: {
						id: true,
						name: true,
						species: true,
						breed: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				service: {
					select: {
						id: true,
						title: true,
						type: true,
						price: true,
						duration: true,
					},
				},
				staff: staffId
					? {
							select: {
								id: true,
								name: true,
								email: true,
							},
						}
					: undefined,
				invoice: {
					select: {
						id: true,
						amount: true,
						status: true,
					},
				},
			},
		})

		return NextResponse.json(appointmentWithInvoice || newAppointment, { status: 201 })
	} catch (error) {
		console.error("[Appointments API] POST error:", error)
		return NextResponse.json(
			{ error: "Failed to create appointment" },
			{ status: 500 }
		)
	}
}

