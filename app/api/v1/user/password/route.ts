import { type NextRequest, NextResponse } from "next/server"
import { currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const currentUser = await currentUserServer()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isCorrectPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isCorrectPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
