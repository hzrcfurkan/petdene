import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: { currencyPreference: true },
		})

		const settings = {
			emailNotifications: true,
			smsNotifications: false,
			bookingReminders: true,
			promotionalEmails: false,
			currencyPreference: (user?.currencyPreference === "USD" || user?.currencyPreference === "TRY")
				? user.currencyPreference
				: "TRY",
		}

		return NextResponse.json(settings)
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await req.json()
		const { currencyPreference, emailNotifications, smsNotifications, promotionalEmails } = body

		const updateData: Record<string, unknown> = {}
		if (currencyPreference === "USD" || currencyPreference === "TRY") {
			updateData.currencyPreference = currencyPreference
		}

		if (Object.keys(updateData).length > 0) {
			await prisma.user.update({
				where: { id: currentUser.id },
				data: updateData,
			})
		}

		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: { currencyPreference: true },
		})

		const settings = {
			emailNotifications: emailNotifications ?? true,
			smsNotifications: smsNotifications ?? false,
			promotionalEmails: promotionalEmails ?? false,
			currencyPreference: (user?.currencyPreference === "USD" || user?.currencyPreference === "TRY")
				? user.currencyPreference
				: "TRY",
		}

		return NextResponse.json(settings)
	} catch (error) {
		return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
	}
}
