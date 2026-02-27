"use client"

import { jsPDF } from "jspdf"
import { type Visit } from "@/lib/react-query/hooks/visits"
import { format } from "date-fns"
import { formatCurrency, type DisplayCurrency } from "@/lib/utils/currency"

export function generateVisitPDF(visit: Visit, displayCurrency: DisplayCurrency = "TRY") {
	if (!visit) {
		throw new Error("Visit data is required")
	}

	if (typeof window === "undefined") {
		throw new Error("PDF generation must be done on the client side")
	}

	const doc = new jsPDF()
	const pageWidth = doc.internal.pageSize.getWidth()
	const pageHeight = doc.internal.pageSize.getHeight()
	const margin = 20
	const contentWidth = pageWidth - 2 * margin

	// Colors
	const primaryColor = [59, 130, 246] // blue-500
	const grayColor = [107, 114, 128]
	const lightGrayColor = [243, 244, 246]

	// Header
	doc.setFillColor(...primaryColor)
	doc.rect(0, 0, pageWidth, 45, "F")

	doc.setTextColor(255, 255, 255)
	doc.setFontSize(22)
	doc.setFont("helvetica", "bold")
	doc.text("Pet Care Clinic", margin, 22)

	doc.setFontSize(14)
	doc.setFont("helvetica", "normal")
	doc.text(`Visit PRO-${visit.protocolNumber}`, pageWidth - margin - 50, 22)

	doc.setTextColor(0, 0, 0)

	let yPos = 58

	// Visit info
	doc.setFontSize(11)
	doc.setFont("helvetica", "bold")
	doc.text("Visit Date:", margin, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(format(new Date(visit.visitDate), "MMMM dd, yyyy HH:mm"), margin + 30, yPos)

	doc.setFont("helvetica", "bold")
	doc.text("Status:", pageWidth - margin - 60, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(visit.status, pageWidth - margin - 5, yPos)

	yPos += 12

	// Patient (Pet) & Owner
	doc.setFont("helvetica", "bold")
	doc.text("Patient:", margin, yPos)
	doc.setFont("helvetica", "normal")
	if (visit.pet) {
		doc.text(
			`${visit.pet.name} (${visit.pet.species})${visit.pet.patientNumber ? ` • ${visit.pet.patientNumber}` : ""}`,
			margin + 25,
			yPos
		)
		yPos += 6
		if (visit.pet.owner) {
			doc.setFont("helvetica", "bold")
			doc.text("Owner:", margin, yPos)
			doc.setFont("helvetica", "normal")
			doc.text(
				`${visit.pet.owner.name || ""} ${visit.pet.owner.email || ""}`.trim(),
				margin + 25,
				yPos
			)
			yPos += 6
			if (visit.pet.owner.phone) {
				doc.text(`Phone: ${visit.pet.owner.phone}`, margin + 25, yPos)
				yPos += 6
			}
		}
	}
	yPos += 8

	// Staff
	if (visit.staff) {
		doc.setFont("helvetica", "bold")
		doc.text("Staff:", margin, yPos)
		doc.setFont("helvetica", "normal")
		doc.text(visit.staff.name || visit.staff.email || "", margin + 25, yPos)
		yPos += 8
	}

	yPos += 4

	// --- SERVICES ---
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 8

	doc.setFont("helvetica", "bold")
	doc.setFontSize(12)
	doc.text("Services", margin, yPos)
	yPos += 8

	if (visit.services && visit.services.length > 0) {
		doc.setFillColor(...lightGrayColor)
		doc.rect(margin, yPos - 4, contentWidth, 8, "F")
		doc.setFont("helvetica", "bold")
		doc.setFontSize(9)
		doc.text("Service", margin + 3, yPos + 1)
		doc.text("Qty", margin + 90, yPos + 1)
		doc.text("Unit Price", margin + 110, yPos + 1)
		doc.text("Total", pageWidth - margin - 25, yPos + 1, { align: "right" })
		yPos += 10

		doc.setFont("helvetica", "normal")
		doc.setFontSize(9)
		for (const vs of visit.services) {
			doc.text(vs.service?.title || "Service", margin + 3, yPos)
			doc.text(String(vs.quantity), margin + 92, yPos)
			doc.text(formatCurrency(vs.unitPrice, displayCurrency), margin + 108, yPos)
			doc.text(formatCurrency(vs.total, displayCurrency), pageWidth - margin - 3, yPos, { align: "right" })
			yPos += 6
		}
		yPos += 4
		doc.setFont("helvetica", "bold")
		doc.text("Services Total:", margin, yPos)
		doc.text(formatCurrency(visit.totalAmount, displayCurrency), pageWidth - margin - 3, yPos, {
			align: "right",
		})
		yPos += 10
	} else {
		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		doc.text("No services added.", margin, yPos)
		yPos += 10
	}

	yPos += 6

	// --- MEDICAL RECORD ---
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 8

	doc.setFont("helvetica", "bold")
	doc.setFontSize(12)
	doc.text("Medical Record (Epicrisis)", margin, yPos)
	yPos += 8

	const mr = visit.medicalRecord
	if (mr) {
		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		const sections = [
			["Complaints", mr.complaints],
			["Examination Notes", mr.examinationNotes],
			["Diagnosis", mr.diagnosis],
			["Treatments Performed", mr.treatmentsPerformed],
			["Recommendations", mr.recommendations],
		]
		for (const [label, value] of sections) {
			if (value) {
				doc.setFont("helvetica", "bold")
				doc.text(`${label}:`, margin, yPos)
				yPos += 5
				doc.setFont("helvetica", "normal")
				const lines = doc.splitTextToSize(value, contentWidth - 5)
				doc.text(lines, margin + 3, yPos)
				yPos += lines.length * 5 + 4
			}
		}
		if (yPos > pageHeight - 60) {
			doc.addPage()
			yPos = 20
		}
	} else {
		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		doc.text("No medical record.", margin, yPos)
		yPos += 8
	}

	yPos += 6

	// --- PAYMENTS ---
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 8

	doc.setFont("helvetica", "bold")
	doc.setFontSize(12)
	doc.text("Payments", margin, yPos)
	yPos += 8

	if (visit.payments && visit.payments.length > 0) {
		doc.setFillColor(...lightGrayColor)
		doc.rect(margin, yPos - 4, contentWidth, 8, "F")
		doc.setFont("helvetica", "bold")
		doc.setFontSize(9)
		doc.text("Method", margin + 3, yPos + 1)
		doc.text("Amount", margin + 50, yPos + 1)
		doc.text("Date", margin + 100, yPos + 1)
		doc.text("Status", pageWidth - margin - 30, yPos + 1, { align: "right" })
		yPos += 10

		doc.setFont("helvetica", "normal")
		doc.setFontSize(9)
		for (const p of visit.payments) {
			doc.text(p.method, margin + 3, yPos)
			doc.text(formatCurrency(p.amount, displayCurrency), margin + 48, yPos)
			doc.text(
				p.paidAt ? format(new Date(p.paidAt), "MMM dd, yyyy HH:mm") : "-",
				margin + 98,
				yPos
			)
			doc.text(p.status || "COMPLETED", pageWidth - margin - 3, yPos, { align: "right" })
			yPos += 6
		}
		yPos += 4
	} else {
		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		doc.text("No payments recorded.", margin, yPos)
		yPos += 8
	}

	yPos += 8

	// --- SUMMARY ---
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 10

	doc.setFont("helvetica", "bold")
	doc.setFontSize(11)
	doc.text("Total Amount:", margin, yPos)
	doc.text(formatCurrency(visit.totalAmount, displayCurrency), pageWidth - margin - 3, yPos, {
		align: "right",
	})
	yPos += 7
	doc.text("Paid Amount:", margin, yPos)
	doc.text(formatCurrency(visit.paidAmount, displayCurrency), pageWidth - margin - 3, yPos, {
		align: "right",
	})
	yPos += 7
	const balance = visit.totalAmount - visit.paidAmount
	doc.text("Balance:", margin, yPos)
	doc.text(formatCurrency(balance, displayCurrency), pageWidth - margin - 3, yPos, {
		align: "right",
	})

	// Footer
	const footerY = pageHeight - 25
	doc.setFontSize(8)
	doc.setTextColor(...grayColor)
	doc.setFont("helvetica", "normal")
	doc.text(
		`Visit details generated on ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}`,
		pageWidth / 2,
		footerY,
		{ align: "center" }
	)

	// Filename
	const dateStr = format(new Date(visit.visitDate), "yyyy-MM-dd")
	const petName = visit.pet?.name || "Visit"
	const safeName = petName.replace(/[^a-zA-Z0-9]/g, "-")
	const filename = `Visit-PRO-${visit.protocolNumber}-${safeName}-${dateStr}.pdf`

	doc.save(filename)
}
