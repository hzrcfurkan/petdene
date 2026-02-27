import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendTemplateMessage, sendTextMessage } from "@/lib/whatsapp/send-message"

/**
 * Cron job: Send WhatsApp reminders 1 day before appointments.
 * Call this route daily (e.g. via Vercel Cron or external cron like cron-job.org).
 *
 * Vercel Cron (vercel.json):
 * "crons": [{ "path": "/api/cron/whatsapp-reminders", "schedule": "0 9 * * *" }]
 *
 * Or use: https://cron-job.org to hit GET/POST this URL daily.
 */
export async function GET(req: NextRequest) {
	return runReminders(req)
}

export async function POST(req: NextRequest) {
	return runReminders(req)
}

async function runReminders(req: NextRequest) {
	// Optional: Verify cron secret to prevent unauthorized calls
	const authHeader = req.headers.get("authorization")
	const cronSecret = process.env.CRON_SECRET
	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
	const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

	if (!phoneNumberId || !accessToken) {
		console.warn("[WhatsApp Reminders] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN")
		return NextResponse.json({
			ok: false,
			message: "WhatsApp not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN.",
			sent: 0,
		})
	}

	// Find appointments 1 day from now (tomorrow)
	const now = new Date()
	const tomorrowStart = new Date(now)
	tomorrowStart.setDate(tomorrowStart.getDate() + 1)
	tomorrowStart.setHours(0, 0, 0, 0)
	const tomorrowEnd = new Date(tomorrowStart)
	tomorrowEnd.setDate(tomorrowEnd.getDate() + 1)

	const appointments = await prisma.appointment.findMany({
		where: {
			date: { gte: tomorrowStart, lt: tomorrowEnd },
			status: { in: ["PENDING", "CONFIRMED"] },
		},
		select: {
			id: true,
			date: true,
			pet: {
				select: {
					name: true,
					owner: {
						select: { phone: true, name: true },
					},
				},
			},
			service: { select: { title: true } },
		},
	})

	let sent = 0
	const templateName = process.env.WHATSAPP_APPOINTMENT_TEMPLATE || "appointment_reminder"

	for (const apt of appointments) {
		const phone = apt.pet?.owner?.phone
		if (!phone) continue

		const petName = apt.pet?.name || "Your pet"
		const dateStr = apt.date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		})
		const timeStr = apt.date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		})

		// Try template first (required for business-initiated).
		// Create template in Meta Business Manager with body e.g.:
		// "Hello! Reminder: {{1}} has an appointment on {{2}} at {{3}}. See you soon!"
		let result = await sendTemplateMessage(
			phoneNumberId,
			accessToken,
			phone,
			templateName,
			"en",
			[
				{
					type: "body",
					parameters: [
						{ type: "text", text: petName },
						{ type: "text", text: dateStr },
						{ type: "text", text: timeStr },
					],
				},
			]
		)

		// Fallback to text if template fails (e.g. template not created yet)
		if (!result.success && result.error?.includes("template")) {
			const textBody = `Reminder: ${petName} has an appointment tomorrow (${dateStr}) at ${timeStr}. Service: ${apt.service?.title || "N/A"}. See you soon!`
			result = await sendTextMessage(phoneNumberId, accessToken, phone, textBody)
		}

		if (result.success) {
			sent++
		} else {
			console.error(`[WhatsApp Reminders] Failed for appointment ${apt.id}:`, result.error)
		}
	}

	return NextResponse.json({
		ok: true,
		sent,
		total: appointments.length,
		message: `Sent ${sent} reminder(s) for ${appointments.length} appointment(s) tomorrow.`,
	})
}
