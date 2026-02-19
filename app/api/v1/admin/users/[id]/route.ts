import { canAccessResource, currentUserServer } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (!canAccessResource(currentUser.role, "ADMIN")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		const { name, email, phone, password } = await req.json()

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		// Check if email is being changed and if it's already taken by another user
		if (email && email !== existingUser.email) {
			const emailTaken = await prisma.user.findUnique({
				where: { email },
			})

			if (emailTaken) {
				return NextResponse.json({ error: "Email already in use" }, { status: 400 })
			}
		}

		// Prepare update data
		const updateData: any = {}
		if (name !== undefined && name !== null) updateData.name = name
		if (email !== undefined && email !== null) updateData.email = email
		if (phone !== undefined && phone !== null) updateData.phone = phone
		if (password && password.trim() !== "") {
			updateData.password = await bcrypt.hash(password, 10)
		}

		// Check if there's anything to update
		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 })
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				createdAt: true,
			},
		})

		return NextResponse.json(updatedUser)
	} catch (error) {
		console.error("[v0] Update user error:", error)
		return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
	}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const currentUser = await currentUserServer()
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (currentUser.role !== "SUPER_ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		await prisma.user.delete({
			where: { id },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
	}
}
