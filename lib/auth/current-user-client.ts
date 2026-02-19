"use client"
import { useSession } from "next-auth/react"
import { normalizeRole } from './rbac'

type UserRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER"

interface SessionUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: UserRole
}

export interface CurrentUser extends SessionUser {
  id: string
  isSuperAdmin: boolean
  isAdmin: boolean
  isStaff: boolean
  isCustomer: boolean
}

export default function currentUserClient(): CurrentUser | null {
  const { data: session, status } = useSession()

  if (status === "loading" || status === "unauthenticated" || !session?.user?.email) {
    return null
  }

  // cast role safely
  const role: UserRole = normalizeRole(session.user.role)

  return {
    id: (session.user as any).id || "",
    ...session.user,
    role,
    isSuperAdmin: role === "SUPER_ADMIN",
    isAdmin: role === "ADMIN",
    isStaff: role === "STAFF",
    isCustomer: role === "CUSTOMER",
  }
}
