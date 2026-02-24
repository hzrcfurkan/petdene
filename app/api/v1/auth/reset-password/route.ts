import { prisma } from "@/lib/db/prisma"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
	try {
		const { token, email, password } = await req.json()

		if (!token || !email || !password) {
			return NextResponse.json({ error: "Token, email, and password are required" }, { status: 400 })
		}

		if (password.length < 8) {
			return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
		}

		// Verify token
		const verificationToken = await prisma.verificationToken.findUnique({
			where: {
				identifier_token: {
					identifier: email,
					token: token,
				},
			},
		})

		if (!verificationToken) {
			return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
		}

		if (verificationToken.expires < new Date()) {
			return NextResponse.json({ error: "Reset token has expired" }, { status: 400 })
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Update user password
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedPassword },
		})

		// Delete used token
		await prisma.verificationToken.delete({
			where: {
				identifier_token: {
					identifier: email,
					token: token,
				},
			},
		})

		return NextResponse.json({ message: "Password reset successfully" })
	} catch (error) {
		console.error("Reset password error:", error)
		return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
	}
}

