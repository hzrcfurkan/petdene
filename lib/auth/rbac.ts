export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "NURSE" | "CUSTOMER"

export const ROLE_HIERARCHY: Record<UserRole, number> = {
	SUPER_ADMIN: 5,
	ADMIN:       4,
	DOCTOR:      3,
	NURSE:       2,
	CUSTOMER:    1,
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
	SUPER_ADMIN: [
		"manage_users", "manage_roles", "manage_services",
		"manage_bookings", "view_analytics", "manage_staff",
		"view_reports", "system_settings",
	],
	ADMIN:  ["manage_services", "manage_bookings", "view_analytics", "manage_staff", "view_reports"],
	DOCTOR: ["view_bookings", "update_booking_status", "view_services", "view_patients", "manage_orders", "manage_medical"],
	NURSE:  ["view_bookings", "update_booking_status", "view_services", "view_patients", "manage_orders"],
	CUSTOMER: ["book_services", "view_own_bookings", "cancel_own_bookings"],
}

export function hasPermission(role: UserRole, permission: string): boolean {
	return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canAccessResource(userRole: UserRole, requiredRole: UserRole): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function getRoleLabel(role: UserRole): string {
	const labels: Record<UserRole, string> = {
		SUPER_ADMIN: "Süper Admin",
		ADMIN:       "Admin",
		DOCTOR:      "Doktor",
		NURSE:       "Hemşire",
		CUSTOMER:    "Müşteri",
	}
	return labels[role] || role
}

export const isValidUserRole = (role: any): role is UserRole => {
	return ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "CUSTOMER"].includes(role)
}

export const normalizeRole = (role: any): UserRole => {
	// Geriye dönük uyumluluk: eski STAFF rolü NURSE'e map edilir
	if (role === "STAFF") return "NURSE"
	if (isValidUserRole(role)) return role
	return "CUSTOMER"
}
