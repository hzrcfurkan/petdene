"use client"

import { usePathname } from "next/navigation"
import { EnhancedSuperAdminDashboard } from "@/components/features/dashboard"

export function SuperAdminDashboard() {
	const pathname = usePathname()

	if (pathname !== "/super") {
		return null
	}

	return <EnhancedSuperAdminDashboard />
}
