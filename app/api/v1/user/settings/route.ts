import { currentUserServer } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const currentUser = await currentUserServer()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = {
      emailNotifications: true,
      smsNotifications: false,
      bookingReminders: true,
      promotionalEmails: false,
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

    const settings = await req.json()

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
