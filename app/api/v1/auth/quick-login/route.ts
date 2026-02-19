import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import { USER_ROLES } from "@/lib/constants"

const TEST_USERS = {
	[USER_ROLES.SUPER_ADMIN]: {
		email: "superadmin@petcare.com",
		name: "Super Admin",
		password: "password123",
	},
	[USER_ROLES.ADMIN]: {
		email: "admin@petcare.com",
		name: "Admin User",
		password: "password123",
	},
	[USER_ROLES.STAFF]: {
		email: "sarah.johnson@petcare.com",
		name: "Dr. Sarah Johnson",
		password: "password123",
	},
	[USER_ROLES.CUSTOMER]: {
		email: "john.doe@example.com",
		name: "John Doe",
		password: "password123",
	},
} as const

export async function POST(req: NextRequest) {
	try {
		const { role } = await req.json()

		if (!role || !Object.values(USER_ROLES).includes(role as any)) {
			return NextResponse.json({ error: "Invalid role" }, { status: 400 })
		}

		const testUser = TEST_USERS[role as keyof typeof TEST_USERS]

		if (!testUser) {
			return NextResponse.json({ error: "Test user not found for role" }, { status: 400 })
		}

		// Check if user exists
		let user = await prisma.user.findUnique({
			where: { email: testUser.email },
		})

		// Create user if doesn't exist
		if (!user) {
			const hashedPassword = await bcrypt.hash(testUser.password, 10)
			user = await prisma.user.create({
				data: {
					email: testUser.email,
					name: testUser.name,
					password: hashedPassword,
					role: role,
				},
			})
		} else {
			// Update role and password if user exists
			const hashedPassword = await bcrypt.hash(testUser.password, 10)
			user = await prisma.user.update({
				where: { id: user.id },
				data: { 
					role: role,
					password: hashedPassword, // Reset password to ensure it works
				},
			})
		}

		return NextResponse.json({
			email: testUser.email,
			password: testUser.password,
			role: user.role,
		})
	} catch (error) {
		console.error("[Quick Login] Error:", error)
		const errorMessage = error instanceof Error ? error.message : "Failed to setup quick login"
		return NextResponse.json({ error: errorMessage }, { status: 500 })
	}
}

