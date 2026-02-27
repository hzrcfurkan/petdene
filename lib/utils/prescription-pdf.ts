"use client"

import { jsPDF } from "jspdf"
import { type Prescription } from "@/lib/react-query/hooks/prescriptions"
import { format } from "date-fns"

export function generatePrescriptionPDF(prescription: Prescription) {
	if (!prescription) {
		throw new Error("Prescription data is required")
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
	const primaryColor = [34, 197, 94] // green-500 - medical/prescription theme
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
	doc.text("PRESCRIPTION", pageWidth - margin - 40, 22)

	doc.setTextColor(0, 0, 0)

	let yPos = 60

	// Prescription ID and Date
	doc.setFontSize(11)
	doc.setFont("helvetica", "bold")
	doc.text("Prescription #:", margin, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(prescription.id.slice(0, 8).toUpperCase(), margin + 35, yPos)

	doc.setFont("helvetica", "bold")
	doc.text("Date Issued:", pageWidth - margin - 70, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(format(new Date(prescription.dateIssued), "MMM dd, yyyy"), pageWidth - margin - 5, yPos)

	yPos += 18

	// Patient (Pet) Information
	doc.setFont("helvetica", "bold")
	doc.setFontSize(11)
	doc.text("Patient:", margin, yPos)
	doc.setFont("helvetica", "normal")
	if (prescription.pet) {
		doc.text(`${prescription.pet.name} (${prescription.pet.species})`, margin + 25, yPos)
		if (prescription.pet.breed) {
			doc.text(`Breed: ${prescription.pet.breed}`, margin + 25, yPos + 6)
		}
	}
	yPos += 14

	// Owner Information
	if (prescription.pet?.owner) {
		doc.setFont("helvetica", "bold")
		doc.text("Owner:", margin, yPos)
		doc.setFont("helvetica", "normal")
		doc.text(prescription.pet.owner.name || prescription.pet.owner.email, margin + 25, yPos)
		doc.text(prescription.pet.owner.email, margin + 25, yPos + 6)
		yPos += 16
	}

	yPos += 5

	// Line separator
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 12

	// Medication Section
	doc.setFillColor(...lightGrayColor)
	doc.rect(margin, yPos - 4, contentWidth, 10, "F")
	doc.setFont("helvetica", "bold")
	doc.setFontSize(10)
	doc.text("Medication", margin + 5, yPos + 2)
	doc.text("Dosage", margin + 90, yPos + 2)

	yPos += 14

	// Medicine details
	doc.setFont("helvetica", "bold")
	doc.setFontSize(12)
	doc.text(prescription.medicineName, margin + 5, yPos)

	doc.setFont("helvetica", "normal")
	doc.setFontSize(11)
	doc.text(prescription.dosage || "As directed", margin + 90, yPos)

	yPos += 12

	// Instructions
	if (prescription.instructions) {
		doc.setFont("helvetica", "bold")
		doc.setFontSize(10)
		doc.text("Instructions:", margin, yPos)
		yPos += 6

		const instructions = doc.splitTextToSize(prescription.instructions, contentWidth - 5)
		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		doc.text(instructions, margin + 5, yPos)
		yPos += instructions.length * 6 + 10
	}

	yPos += 10

	// Issued By
	doc.setFont("helvetica", "bold")
	doc.setFontSize(10)
	doc.text("Prescribed by:", margin, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(prescription.issuedBy?.name || prescription.issuedBy?.email || "Veterinarian", margin + 35, yPos)
	yPos += 6
	doc.text(prescription.issuedBy?.email || "", margin + 35, yPos)

	yPos += 20

	// Signature line
	doc.setDrawColor(...grayColor)
	doc.line(margin, yPos, margin + 80, yPos)
	doc.setFont("helvetica", "normal")
	doc.setFontSize(8)
	doc.setTextColor(...grayColor)
	doc.text("Veterinarian Signature", margin, yPos + 8)

	// Footer
	const footerY = pageHeight - 25
	doc.setFontSize(8)
	doc.setTextColor(...grayColor)
	doc.text(
		`Prescription generated on ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}`,
		pageWidth / 2,
		footerY,
		{ align: "center" }
	)
	doc.text("This is a medical document. Keep for your records.", pageWidth / 2, footerY + 6, { align: "center" })

	// Filename
	const dateStr = format(new Date(prescription.dateIssued), "yyyy-MM-dd")
	const petName = prescription.pet?.name || "Prescription"
	const safeName = petName.replace(/[^a-zA-Z0-9]/g, "-")
	const filename = `Prescription-${safeName}-${dateStr}.pdf`

	doc.save(filename)
}
