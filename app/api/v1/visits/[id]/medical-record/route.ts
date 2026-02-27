import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: visitId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const visit = await prisma.visit.findUnique({
			where: { id: visitId },
			select: {
				id: true,
				pet: { select: { ownerId: true } },
				medicalRecord: true,
			},
		})
		if (!visit) {
			return NextResponse.json({ error: "Visit not found" }, { status: 404 })
		}
		if (currentUser.isCustomer && visit.pet.ownerId !== currentUser.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		return NextResponse.json(visit.medicalRecord || null)
	} catch (error) {
		console.error("[Visit Medical Record API] GET error:", error)
		return NextResponse.json({ error: "Failed to fetch medical record" }, { status: 500 })
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: visitId } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const {
			complaints,
			examinationNotes,
			diagnosis,
			treatmentsPerformed,
			recommendations,
			title,
		} = body

		const visit = await prisma.visit.findUnique({
			where: { id: visitId },
			select: { id: true, petId: true, medicalRecord: true },
		})
		if (!visit) {
			return NextResponse.json({ error: "Visit not found" }, { status: 404 })
		}

		const data = {
			petId: visit.petId,
			visitId,
			title: title || `Visit ${visitId.slice(0, 8)}`,
			complaints: complaints || null,
			examinationNotes: examinationNotes || null,
			diagnosis: diagnosis || null,
			treatmentsPerformed: treatmentsPerformed || null,
			recommendations: recommendations || null,
		}

		let record
		if (visit.medicalRecord) {
			record = await prisma.medicalRecord.update({
				where: { id: visit.medicalRecord.id },
				data: {
					complaints: data.complaints,
					examinationNotes: data.examinationNotes,
					diagnosis: data.diagnosis,
					treatmentsPerformed: data.treatmentsPerformed,
					recommendations: data.recommendations,
					title: data.title,
				},
				select: {
					id: true,
					petId: true,
					visitId: true,
					title: true,
					complaints: true,
					examinationNotes: true,
					diagnosis: true,
					treatmentsPerformed: true,
					recommendations: true,
					date: true,
				},
			})
		} else {
			record = await prisma.medicalRecord.create({
				data,
				select: {
					id: true,
					petId: true,
					visitId: true,
					title: true,
					complaints: true,
					examinationNotes: true,
					diagnosis: true,
					treatmentsPerformed: true,
					recommendations: true,
					date: true,
				},
			})
		}

		return NextResponse.json(record, { status: visit.medicalRecord ? 200 : 201 })
	} catch (error) {
		console.error("[Visit Medical Record API] POST error:", error)
		return NextResponse.json({ error: "Failed to save medical record" }, { status: 500 })
	}
}
