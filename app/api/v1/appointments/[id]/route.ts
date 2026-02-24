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

		const appointment = await prisma.appointment.findUnique({
			where: { id },
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
						gender: true,
						age: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
								phone: true,
							},
						},
					},
				},
				service: {
					select: {
						id: true,
						title: true,
						type: true,
						description: true,
						price: true,
						duration: true,
					},
				},
				staff: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				invoice: {
					select: {
						id: true,
						amount: true,
						status: true,
						createdAt: true,
						payment: {
							select: {
								id: true,
								method: true,
								amount: true,
								paidAt: true,
							},
						},
					},
				},
			},
		})

		if (!appointment) {
			return NextResponse.json(
				{ error: "Appointment not found" },
				{ status: 404 }
			)
		}

		// Role-based access: CUSTOMER can only see appointments for their pets
		if (currentUser.isCustomer) {
			const pet = await prisma.pet.findUnique({
				where: { id: appointment.petId },
				select: { ownerId: true },
			})

			if (!pet || pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}
		}

		return NextResponse.json(appointment)
	} catch (error) {
		console.error("[Appointments API] GET by ID error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch appointment" },
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

		// Check if appointment exists
		const existingAppointment = await prisma.appointment.findUnique({
			where: { id },
			include: {
				pet: {
					select: { ownerId: true },
				},
			},
		})

		if (!existingAppointment) {
			return NextResponse.json(
				{ error: "Appointment not found" },
				{ status: 404 }
			)
		}

		const body = await req.json()
		const { petId, serviceId, staffId, date, status, notes } = body

		// Role-based access: CUSTOMER can only update their own appointments (and only cancel)
		if (currentUser.isCustomer) {
			if (existingAppointment.pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}

			// CUSTOMER can only cancel (status change to CANCELLED) or update notes
			if (status && status !== "CANCELLED" && status !== existingAppointment.status) {
				return NextResponse.json(
					{
						error:
							"Customers can only cancel appointments. Contact staff for other status changes.",
					},
					{ status: 403 }
				)
			}

			// CUSTOMER cannot change pet, service, staff, or date
			if (petId || serviceId || staffId || date) {
				return NextResponse.json(
					{
						error:
							"Customers cannot change appointment details. Please cancel and create a new appointment.",
					},
					{ status: 403 }
				)
			}
		}

		// Prepare update data
		const updateData: any = {}

		// Only STAFF/ADMIN/SUPER_ADMIN can change pet, service, staff, or date
		if (canAccessResource(currentUser.role as any, "STAFF")) {
			if (petId !== undefined) {
				// Verify pet exists
				const pet = await prisma.pet.findUnique({
					where: { id: petId },
				})
				if (!pet) {
					return NextResponse.json({ error: "Pet not found" }, { status: 404 })
				}
				updateData.petId = petId
			}

			if (serviceId !== undefined) {
				// Verify service exists and is active
				const service = await prisma.petService.findUnique({
					where: { id: serviceId },
				})
				if (!service) {
					return NextResponse.json(
						{ error: "Service not found" },
						{ status: 404 }
					)
				}
				updateData.serviceId = serviceId
			}

			if (staffId !== undefined) {
				if (staffId === null) {
					updateData.staffId = null
				} else {
					// Verify staff exists
					const staff = await prisma.user.findUnique({
						where: { id: staffId },
						select: { id: true, role: true },
					})
					if (!staff) {
						return NextResponse.json(
							{ error: "Staff member not found" },
							{ status: 404 }
						)
					}
					if (!["STAFF", "ADMIN", "SUPER_ADMIN"].includes(staff.role)) {
						return NextResponse.json(
							{ error: "Assigned user must be staff, admin, or super admin" },
							{ status: 400 }
						)
					}
					updateData.staffId = staffId
				}
			}

			if (date !== undefined) {
				const appointmentDate = new Date(date)
				// Allow past dates if status is COMPLETED (for backdating completed appointments)
				const newStatus = status !== undefined ? status : existingAppointment.status
				if (appointmentDate < new Date() && newStatus !== "COMPLETED") {
					return NextResponse.json(
						{ error: "Appointment date must be in the future" },
						{ status: 400 }
					)
				}
				updateData.date = appointmentDate
			}
		}

		// Status updates: STAFF/ADMIN can update status, CUSTOMER can only cancel
		if (status !== undefined) {
			const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
			if (!validStatuses.includes(status)) {
				return NextResponse.json(
					{
						error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
					},
					{ status: 400 }
				)
			}

			// Only STAFF/ADMIN/SUPER_ADMIN can change status (except CUSTOMER can cancel)
			if (
				currentUser.isCustomer &&
				status !== "CANCELLED" &&
				status !== existingAppointment.status
			) {
				return NextResponse.json(
					{ error: "Only staff can update appointment status" },
					{ status: 403 }
				)
			}

			updateData.status = status

			// Auto-generate invoice when status changes to CONFIRMED
			if (status === "CONFIRMED" && existingAppointment.status !== "CONFIRMED") {
				// Check if invoice already exists
				const existingInvoice = await prisma.invoice.findUnique({
					where: { appointmentId: id },
				})

				if (!existingInvoice) {
					// Get service price
					const service = await prisma.petService.findUnique({
						where: { id: existingAppointment.serviceId },
						select: { price: true },
					})

					if (service) {
						await prisma.invoice.create({
							data: {
								appointmentId: id,
								amount: service.price,
								status: "UNPAID",
							},
						})
					}
				}
			}
		}

		if (notes !== undefined) {
			updateData.notes = notes || null
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 }
			)
		}

		const updatedAppointment = await prisma.appointment.update({
			where: { id },
			data: updateData,
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
		})

		return NextResponse.json(updatedAppointment)
	} catch (error) {
		console.error("[Appointments API] PUT error:", error)
		return NextResponse.json(
			{ error: "Failed to update appointment" },
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

		// Check if appointment exists
		const existingAppointment = await prisma.appointment.findUnique({
			where: { id },
			include: {
				pet: {
					select: { ownerId: true },
				},
				invoice: {
					select: { id: true, status: true },
				},
			},
		})

		if (!existingAppointment) {
			return NextResponse.json(
				{ error: "Appointment not found" },
				{ status: 404 }
			)
		}

		// Role-based access: CUSTOMER can only delete their own appointments
		if (currentUser.isCustomer) {
			if (existingAppointment.pet.ownerId !== currentUser.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 })
			}

			// CUSTOMER cannot delete if appointment is COMPLETED or has paid invoice
			if (existingAppointment.status === "COMPLETED") {
				return NextResponse.json(
					{
						error: "Cannot delete completed appointments",
					},
					{ status: 400 }
				)
			}

			if (
				existingAppointment.invoice &&
				existingAppointment.invoice.status === "PAID"
			) {
				return NextResponse.json(
					{
						error:
							"Cannot delete appointment with paid invoice. Please contact support.",
					},
					{ status: 400 }
				)
			}
		}

		// STAFF/ADMIN/SUPER_ADMIN can delete any appointment (with restrictions)
		if (
			canAccessResource(currentUser.role as any, "STAFF") &&
			existingAppointment.invoice &&
			existingAppointment.invoice.status === "PAID"
		) {
			return NextResponse.json(
				{
					error:
						"Cannot delete appointment with paid invoice. Please cancel the invoice first.",
				},
				{ status: 400 }
			)
		}

		// Delete appointment (cascade will handle invoice if not paid)
		await prisma.appointment.delete({
			where: { id },
		})

		return NextResponse.json({ message: "Appointment deleted successfully" })
	} catch (error) {
		console.error("[Appointments API] DELETE error:", error)
		return NextResponse.json(
			{ error: "Failed to delete appointment" },
			{ status: 500 }
		)
	}
}

