import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { email, password, name, phone, role } = body

		if (!email || !password || !name) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
		}

		// Normalize email (lowercase and trim)
		const normalizedEmail = email.trim().toLowerCase()

		const existingUser = await prisma.user.findUnique({
			where: { email: normalizedEmail },
		})

		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const user = await prisma.user.create({
			data: {
				email: normalizedEmail,
				password: hashedPassword,
				name,
				phone,
				role: role || "CUSTOMER",
			},
		})

		return NextResponse.json(
			{
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
			},
			{ status: 201 },
		)
	} catch (error) {
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
	}
}
