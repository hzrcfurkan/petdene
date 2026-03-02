import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { generatePatientNumber } from "@/lib/db/patient-number"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Guest booking - allows unregistered visitors to book an appointment.
 * Creates user account, pet, and appointment in one flow.
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { name, email, phone, petName, species, serviceId, date, notes } = body

		if (!name || !email || !petName || !species || !serviceId || !date) {
			return NextResponse.json(
				{ error: "Name, email, pet name, species, service, and date are required" },
				{ status: 400 }
			)
		}

		// Check if user exists
		let user = await prisma.user.findUnique({
			where: { email: email.trim().toLowerCase() },
		})

		if (!user) {
			const tempPassword = Math.random().toString(36).slice(-12)
			const hashedPassword = await bcrypt.hash(tempPassword, 10)
			user = await prisma.user.create({
				data: {
					name: name.trim(),
					email: email.trim().toLowerCase(),
					phone: phone?.trim() || null,
					password: hashedPassword,
					role: "Müşteri",
				},
			})
		}

		// Verify service exists
		const service = await prisma.petService.findUnique({
			where: { id: serviceId, active: true },
		})
		if (!service) {
			return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 })
		}

		// Create pet
		const patientNumber = await generatePatientNumber()
		const pet = await prisma.pet.create({
			data: {
				patientNumber,
				name: petName.trim(),
				species: species.trim(),
				ownerId: user.id,
			},
		})

		// Create appointment
		const appointment = await prisma.appointment.create({
			data: {
				petId: pet.id,
				serviceId: service.id,
				date: new Date(date),
				status: "Beklemede",
				notes: notes?.trim() || null,
			},
			select: {
				id: true,
				date: true,
				status: true,
				pet: { select: { name: true, species: true } },
				service: { select: { title: true } },
			},
		})

		return NextResponse.json(
			{
				success: true,
				message: "Appointment booked successfully. Please sign in to manage your booking.",
				appointment,
				userId: user.id,
			},
			{ status: 201 }
		)
	} catch (error) {
		console.error("[Guest Booking] Error:", error)
		return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
	}
}
