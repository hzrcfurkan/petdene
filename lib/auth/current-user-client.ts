"use client"
import { useSession } from "next-auth/react"
import { normalizeRole, type UserRole } from './rbac'

export interface CurrentUser {
	id: string
	name?: string | null
	email?: string | null
	image?: string | null
	role: UserRole
	isSuperAdmin: boolean
	isAdmin: boolean
	isDoctor: boolean
	isNurse: boolean
	isStaff: boolean  // geriye dönük uyumluluk
	isCustomer: boolean
}

export default function currentUserClient(): CurrentUser | null {
	const { data: session, status } = useSession()

	if (status === "loading" || status === "unauthenticated" || !session?.user?.email) {
		return null
	}

	const role: UserRole = normalizeRole((session.user as any).role)

	return {
		id:           (session.user as any).id || "",
		...session.user,
		role,
		isSuperAdmin: role === "SUPER_ADMIN",
		isAdmin:      role === "ADMIN",
		isDoctor:     role === "DOCTOR",
		isNurse:      role === "NURSE",
		isStaff:      role === "DOCTOR" || role === "NURSE",
		isCustomer:   role === "CUSTOMER",
	}
}
