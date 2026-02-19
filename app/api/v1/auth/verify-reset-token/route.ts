import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const token = searchParams.get("token")
		const email = searchParams.get("email")

		if (!token || !email) {
			return NextResponse.json({ error: "Token and email are required" }, { status: 400 })
		}

		// Verify token exists and is not expired
		const verificationToken = await prisma.verificationToken.findUnique({
			where: {
				identifier_token: {
					identifier: email,
					token: token,
				},
			},
		})

		if (!verificationToken) {
			return NextResponse.json({ error: "Invalid token" }, { status: 400 })
		}

		if (verificationToken.expires < new Date()) {
			return NextResponse.json({ error: "Token has expired" }, { status: 400 })
		}

		return NextResponse.json({ valid: true })
	} catch (error) {
		console.error("Verify reset token error:", error)
		return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
	}
}

