/**
 * Application constants
 */

export const APP_NAME = "Pet Care"
export const APP_DESCRIPTION = "Comprehensive pet care management system for your furry friends"

// User Roles
export const USER_ROLES = {
	SUPER_ADMIN: "SUPER_ADMIN",
	ADMIN: "ADMIN",
	STAFF: "STAFF",
	CUSTOMER: "CUSTOMER",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// API Routes
export const API_ROUTES = {
	AUTH: {
		SIGNIN: "/api/auth/signin",
		SIGNOUT: "/api/auth/signout",
		SESSION: "/api/auth/session",
	},
	USER: {
		PROFILE: "/api/v1/user/profile",
		SETTINGS: "/api/v1/user/settings",
		PASSWORD: "/api/v1/user/password",
		REGISTER: "/api/v1/user/register",
		GUEST_SIGNUP: "/api/v1/user/guest-signup",
	},
	ADMIN: {
		USERS: "/api/v1/admin/users",
	},
} as const

// Pagination
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	MAX_LIMIT: 100,
} as const

