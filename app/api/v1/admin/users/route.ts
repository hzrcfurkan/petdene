import { canAccessResource, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()

		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role, "ADMIN")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const { searchParams } = new URL(req.url)
		const roleFilter = searchParams.get("role")
		const page = Number.parseInt(searchParams.get("page") || "1")
		const limit = Number.parseInt(searchParams.get("limit") || "10")
		const sort = searchParams.get("sort") || "date-desc"
		const search = searchParams.get("search") || ""
		const skip = (page - 1) * limit

		const where: any = {}

		// Only add role filter if it's not "ALL"
		if (roleFilter && roleFilter !== "ALL") {
			where.role = roleFilter
		}

		// Add search filter for name or email
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			]
		}

		let orderBy: any = { createdAt: "desc" }
		if (sort === "name-asc") {
			orderBy = { name: "asc" }
		} else if (sort === "name-desc") {
			orderBy = { name: "desc" }
		} else if (sort === "date-asc") {
			orderBy = { createdAt: "asc" }
		} else if (sort === "date-desc") {
			orderBy = { createdAt: "desc" }
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					phone: true,
					createdAt: true,
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.user.count({ where }),
		])

		return NextResponse.json({
			users,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("[v0] Users API error:", error)
		return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role, "ADMIN")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const { name, email, phone, password } = await req.json()

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const newStaff = await prisma.user.create({
			data: {
				name,
				email,
				phone,
				password: hashedPassword,
				role: "STAFF",
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				createdAt: true,
			},
		})

		return NextResponse.json(newStaff, { status: 201 })
	} catch (error) {
		console.error("[v0] Create staff error:", error)
		return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	try {
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (currentUser.role !== "SUPER_ADMIN") {
			return NextResponse.json({ error: "Only Super Admin can manage roles" }, { status: 403 })
		}

		const { userId, role } = await req.json()

		if (userId === currentUser.id) {
			return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { role },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
		})

		return NextResponse.json(updatedUser)
	} catch (error) {
		console.error("[v0] Update user role error:", error)
		return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
	}
}
