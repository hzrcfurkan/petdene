"use client"

import { ReactNode } from "react"

interface DashboardManagementSectionProps {
	title: string
	children: ReactNode
}

export function DashboardManagementSection({ title, children }: DashboardManagementSectionProps) {
	return (
		<div>
			<h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
			{children}
		</div>
	)
}

