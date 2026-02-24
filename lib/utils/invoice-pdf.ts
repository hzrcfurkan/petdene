"use client"

import { jsPDF } from "jspdf"
import { type Invoice } from "@/lib/react-query/hooks/invoices"
import { format } from "date-fns"

export function generateInvoicePDF(invoice: Invoice) {
	// Validate invoice data
	if (!invoice) {
		throw new Error("Invoice data is required")
	}

	if (!invoice.appointment) {
		throw new Error("Invoice appointment data is missing. Please refresh and try again.")
	}

	// Ensure we're on the client side
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
	const grayColor = [107, 114, 128] // gray-500
	const lightGrayColor = [243, 244, 246] // gray-100

	// Header
	doc.setFillColor(...primaryColor)
	doc.rect(0, 0, pageWidth, 50, "F")

	// Company/Clinic Name
	doc.setTextColor(255, 255, 255)
	doc.setFontSize(24)
	doc.setFont("helvetica", "bold")
	doc.text("Pet Care Clinic", margin, 25)

	// Invoice Title
	doc.setFontSize(16)
	doc.setFont("helvetica", "normal")
	doc.text("INVOICE", pageWidth - margin - 30, 25)

	// Reset text color
	doc.setTextColor(0, 0, 0)

	let yPos = 70

	// Invoice Number and Date
	doc.setFontSize(12)
	doc.setFont("helvetica", "bold")
	doc.text("Invoice #:", margin, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(invoice.id.slice(0, 8).toUpperCase(), margin + 30, yPos)

	doc.setFont("helvetica", "bold")
	doc.text("Date:", pageWidth - margin - 60, yPos)
	doc.setFont("helvetica", "normal")
	doc.text(format(new Date(invoice.createdAt), "MMM dd, yyyy"), pageWidth - margin - 30, yPos)

	yPos += 15

	// Status Badge
	doc.setFontSize(10)
	doc.setFont("helvetica", "bold")
	const statusColors: Record<string, number[]> = {
		PAID: [34, 197, 94], // green
		UNPAID: [234, 179, 8], // yellow
		CANCELLED: [239, 68, 68], // red
	}
	const statusColor = statusColors[invoice.status] || grayColor
	doc.setFillColor(...statusColor)
	doc.roundedRect(margin, yPos - 5, 30, 8, 2, 2, "F")
	doc.setTextColor(255, 255, 255)
	doc.text(invoice.status, margin + 15, yPos, { align: "center" })
	doc.setTextColor(0, 0, 0)

	yPos += 20

	// Bill To Section
	doc.setFontSize(12)
	doc.setFont("helvetica", "bold")
	doc.text("Bill To:", margin, yPos)

	yPos += 8

	if (invoice.appointment?.pet?.owner) {
		doc.setFont("helvetica", "normal")
		doc.setFontSize(11)
		doc.text(invoice.appointment.pet.owner.name || "Customer", margin, yPos)
		yPos += 6
		doc.text(invoice.appointment.pet.owner.email, margin, yPos)
		yPos += 10
	}

	// Pet Information
	if (invoice.appointment?.pet) {
		doc.setFont("helvetica", "bold")
		doc.setFontSize(11)
		doc.text("Pet:", margin, yPos)
		doc.setFont("helvetica", "normal")
		doc.text(`${invoice.appointment.pet.name} (${invoice.appointment.pet.species})`, margin + 15, yPos)
		yPos += 10
	}

	yPos += 10

	// Line separator
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 10

	// Service Details Table Header
	doc.setFillColor(...lightGrayColor)
	doc.rect(margin, yPos - 5, contentWidth, 10, "F")
	doc.setFont("helvetica", "bold")
	doc.setFontSize(10)
	doc.text("Description", margin + 5, yPos)
	doc.text("Date", margin + 100, yPos)
	doc.text("Amount", pageWidth - margin - 30, yPos, { align: "right" })

	yPos += 12

	// Service Row
	doc.setFont("helvetica", "normal")
	doc.setFontSize(10)
	const serviceTitle = invoice.appointment?.service?.title || "Service"
	doc.text(serviceTitle, margin + 5, yPos)

	if (invoice.appointment?.date) {
		doc.text(format(new Date(invoice.appointment.date), "MMM dd, yyyy"), margin + 100, yPos)
	}

	doc.setFont("helvetica", "bold")
	doc.text(`$${invoice.amount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: "right" })

	yPos += 15

	// Line separator
	doc.setDrawColor(...lightGrayColor)
	doc.line(margin, yPos, pageWidth - margin, yPos)
	yPos += 10

	// Total Section
	doc.setFont("helvetica", "normal")
	doc.setFontSize(10)
	doc.text("Subtotal:", pageWidth - margin - 50, yPos, { align: "right" })
	doc.text(`$${invoice.amount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: "right" })

	yPos += 8

	doc.setFont("helvetica", "bold")
	doc.setFontSize(12)
	doc.text("Total:", pageWidth - margin - 50, yPos, { align: "right" })
	doc.text(`$${invoice.amount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: "right" })

	yPos += 20

	// Payment Information
	if (invoice.payment) {
		doc.setFont("helvetica", "bold")
		doc.setFontSize(11)
		doc.text("Payment Information:", margin, yPos)
		yPos += 8

		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		doc.text(`Method: ${invoice.payment.method}`, margin, yPos)
		yPos += 6
		doc.text(`Amount: $${invoice.payment.amount.toFixed(2)}`, margin, yPos)
		yPos += 6

		if (invoice.payment.paidAt) {
			doc.text(
				`Paid At: ${format(new Date(invoice.payment.paidAt), "MMM dd, yyyy h:mm a")}`,
				margin,
				yPos
			)
			yPos += 6
		}

		if (invoice.payment.transactionId) {
			doc.text(`Transaction ID: ${invoice.payment.transactionId}`, margin, yPos)
			yPos += 6
		}
	} else if (invoice.status === "UNPAID") {
		// Show payment instructions for unpaid invoices
		doc.setFont("helvetica", "bold")
		doc.setFontSize(11)
		doc.text("Payment Instructions:", margin, yPos)
		yPos += 8
		doc.setFont("helvetica", "normal")
		doc.setFontSize(10)
		doc.text("Please pay the amount due to complete your invoice.", margin, yPos)
		yPos += 6
		doc.text("Contact us for payment options.", margin, yPos)
		yPos += 6
	}

	// Footer
	const footerY = pageHeight - 30
	doc.setFontSize(8)
	doc.setTextColor(...grayColor)
	doc.setFont("helvetica", "normal")
	doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" })
	doc.text(
		`Invoice generated on ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}`,
		pageWidth / 2,
		footerY + 8,
		{ align: "center" }
	)

	// Generate filename
	const invoiceNumber = invoice.id.slice(0, 8).toUpperCase()
	const dateStr = format(new Date(invoice.createdAt), "yyyy-MM-dd")
	const filename = `Invoice-${invoiceNumber}-${dateStr}.pdf`

	// Save PDF
	doc.save(filename)
}

