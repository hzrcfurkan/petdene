import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { normalizeRole, type UserRole } from './rbac'

export interface CurrentUserServer {
	id: string
	name?: string | null
	email?: string | null
	role: UserRole
	isSuperAdmin: boolean
	isAdmin: boolean
	isDoctor: boolean
	isNurse: boolean
	isStaff: boolean  // geriye dönük uyumluluk (DOCTOR veya NURSE ise true)
	isCustomer: boolean
	[key: string]: any
}

export default async function currentUserServer(): Promise<CurrentUserServer | null> {
	const session = await getAuthSession()
	if (!session?.user?.email) return null

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	})

	if (!user) return null

	const role: UserRole = normalizeRole(user.role)

	return {
		...user,
		role,
		isSuperAdmin: role === "SUPER_ADMIN",
		isAdmin:      role === "ADMIN",
		isDoctor:     role === "DOCTOR",
		isNurse:      role === "NURSE",
		isStaff:      role === "DOCTOR" || role === "NURSE",
		isCustomer:   role === "CUSTOMER",
	}
}
